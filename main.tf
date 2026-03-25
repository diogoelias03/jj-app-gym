data "oci_identity_availability_domains" "ads" {
  compartment_id = var.tenancy_ocid
}

data "oci_containerengine_cluster_option" "oke" {
  cluster_option_id = "all"
}

data "oci_containerengine_node_pool_option" "oke_np" {
  compartment_id        = var.compartment_ocid
  node_pool_option_id   = "all"
  node_pool_k8s_version = local.selected_k8s_version
}

data "oci_core_services" "all" {
}

data "oci_objectstorage_namespace" "ns" {
  compartment_id = var.tenancy_ocid
}

locals {
  selected_ads         = slice(data.oci_identity_availability_domains.ads.availability_domains, 0, min(var.ad_count, length(data.oci_identity_availability_domains.ads.availability_domains)))
  selected_k8s_version = coalesce(var.oke_kubernetes_version, data.oci_containerengine_cluster_option.oke.kubernetes_versions[0])
  k8s_version_token    = replace(local.selected_k8s_version, "v", "")
  node_sources_filtered = [
    for s in data.oci_containerengine_node_pool_option.oke_np.sources : s
    if can(regex("OKE-${local.k8s_version_token}", s.source_name)) &&
    !can(regex("aarch64", lower(s.source_name))) &&
    !can(regex("gpu", lower(s.source_name)))
  ]
  selected_node_source  = local.node_sources_filtered[0]
  common_defined_tags   = {}
  common_freeform_tags  = { project = var.project_name, managed_by = "terraform", environment = "simulated-client" }
  api_gateway_is_active = var.api_gateway_enabled ? 1 : 0
  adb_is_active         = var.adb_enabled ? 1 : 0
  bucket_is_active      = var.create_object_storage_bucket ? 1 : 0
  policy_is_active      = var.create_lab_policy ? 1 : 0
  oke_node_subnet_id    = var.oke_node_subnet_type == "public" ? oci_core_subnet.public_nodes.id : oci_core_subnet.private_app.id
  waf_is_active         = var.waf_enabled ? 1 : 0
}

resource "oci_core_vcn" "main" {
  compartment_id = var.compartment_ocid
  display_name   = "${var.project_name}-vcn"
  dns_label      = var.service_label
  cidr_blocks    = [var.vcn_cidr]
  freeform_tags  = local.common_freeform_tags
}

resource "oci_core_internet_gateway" "igw" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.main.id
  display_name   = "${var.project_name}-igw"
  enabled        = true
  freeform_tags  = local.common_freeform_tags
}

resource "oci_core_nat_gateway" "nat" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.main.id
  display_name   = "${var.project_name}-nat"
  freeform_tags  = local.common_freeform_tags
}

resource "oci_core_service_gateway" "sgw" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.main.id
  display_name   = "${var.project_name}-sgw"

  services {
    service_id = data.oci_core_services.all.services[0].id
  }

  freeform_tags = local.common_freeform_tags
}

resource "oci_core_route_table" "public_rt" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.main.id
  display_name   = "${var.project_name}-public-rt"

  route_rules {
    destination       = "0.0.0.0/0"
    network_entity_id = oci_core_internet_gateway.igw.id
  }
}

resource "oci_core_route_table" "private_app_rt" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.main.id
  display_name   = "${var.project_name}-private-app-rt"

  route_rules {
    destination       = "0.0.0.0/0"
    network_entity_id = oci_core_nat_gateway.nat.id
  }

  route_rules {
    destination       = data.oci_core_services.all.services[0].cidr_block
    destination_type  = "SERVICE_CIDR_BLOCK"
    network_entity_id = oci_core_service_gateway.sgw.id
  }
}

resource "oci_core_route_table" "private_data_rt" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.main.id
  display_name   = "${var.project_name}-private-data-rt"

  route_rules {
    destination       = data.oci_core_services.all.services[0].cidr_block
    destination_type  = "SERVICE_CIDR_BLOCK"
    network_entity_id = oci_core_service_gateway.sgw.id
  }
}

resource "oci_core_security_list" "lab_allow_all" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.main.id
  display_name   = "${var.project_name}-allow-all-sl"

  egress_security_rules {
    destination = "0.0.0.0/0"
    protocol    = "all"
  }

  ingress_security_rules {
    source   = "0.0.0.0/0"
    protocol = "all"
  }
}

resource "oci_core_subnet" "public_edge" {
  compartment_id             = var.compartment_ocid
  vcn_id                     = oci_core_vcn.main.id
  display_name               = "${var.project_name}-public-edge-sn"
  dns_label                  = "pubedge"
  cidr_block                 = var.public_edge_subnet_cidr
  prohibit_public_ip_on_vnic = false
  route_table_id             = oci_core_route_table.public_rt.id
  security_list_ids          = [oci_core_security_list.lab_allow_all.id]
  freeform_tags              = local.common_freeform_tags
}

resource "oci_core_subnet" "private_app" {
  compartment_id             = var.compartment_ocid
  vcn_id                     = oci_core_vcn.main.id
  display_name               = "${var.project_name}-private-app-sn"
  dns_label                  = "privapp"
  cidr_block                 = var.private_app_subnet_cidr
  prohibit_public_ip_on_vnic = true
  route_table_id             = oci_core_route_table.private_app_rt.id
  security_list_ids          = [oci_core_security_list.lab_allow_all.id]
  freeform_tags              = local.common_freeform_tags
}

resource "oci_core_subnet" "private_data" {
  compartment_id             = var.compartment_ocid
  vcn_id                     = oci_core_vcn.main.id
  display_name               = "${var.project_name}-private-data-sn"
  dns_label                  = "privdata"
  cidr_block                 = var.private_data_subnet_cidr
  prohibit_public_ip_on_vnic = true
  route_table_id             = oci_core_route_table.private_data_rt.id
  security_list_ids          = [oci_core_security_list.lab_allow_all.id]
  freeform_tags              = local.common_freeform_tags
}

resource "oci_core_subnet" "public_nodes" {
  compartment_id             = var.compartment_ocid
  vcn_id                     = oci_core_vcn.main.id
  display_name               = "${var.project_name}-public-nodes-sn"
  dns_label                  = "pubnodes"
  cidr_block                 = var.public_nodes_subnet_cidr
  prohibit_public_ip_on_vnic = false
  route_table_id             = oci_core_route_table.public_rt.id
  security_list_ids          = [oci_core_security_list.lab_allow_all.id]
  freeform_tags              = local.common_freeform_tags
}

resource "oci_core_network_security_group" "lb" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.main.id
  display_name   = "${var.project_name}-lb-nsg"
}

resource "oci_core_network_security_group_security_rule" "lb_ingress_http" {
  network_security_group_id = oci_core_network_security_group.lb.id
  direction                 = "INGRESS"
  protocol                  = "6"
  source                    = "0.0.0.0/0"

  tcp_options {
    destination_port_range {
      min = 80
      max = 80
    }
  }
}

resource "oci_core_network_security_group_security_rule" "lb_ingress_https" {
  network_security_group_id = oci_core_network_security_group.lb.id
  direction                 = "INGRESS"
  protocol                  = "6"
  source                    = "0.0.0.0/0"

  tcp_options {
    destination_port_range {
      min = 443
      max = 443
    }
  }
}

resource "oci_core_network_security_group_security_rule" "lb_egress_all" {
  network_security_group_id = oci_core_network_security_group.lb.id
  direction                 = "EGRESS"
  protocol                  = "all"
  destination               = "0.0.0.0/0"
}

resource "oci_core_network_security_group" "oke_api" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.main.id
  display_name   = "${var.project_name}-oke-api-nsg"
}

resource "oci_core_network_security_group_security_rule" "oke_api_ingress" {
  network_security_group_id = oci_core_network_security_group.oke_api.id
  direction                 = "INGRESS"
  protocol                  = "6"
  source                    = "0.0.0.0/0"

  tcp_options {
    destination_port_range {
      min = 6443
      max = 6443
    }
  }
}

resource "oci_core_network_security_group_security_rule" "oke_api_egress" {
  network_security_group_id = oci_core_network_security_group.oke_api.id
  direction                 = "EGRESS"
  protocol                  = "all"
  destination               = "0.0.0.0/0"
}

resource "oci_core_network_security_group" "oke_nodes" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.main.id
  display_name   = "${var.project_name}-oke-nodes-nsg"
}

resource "oci_core_network_security_group_security_rule" "oke_nodes_ingress_vcn" {
  network_security_group_id = oci_core_network_security_group.oke_nodes.id
  direction                 = "INGRESS"
  protocol                  = "all"
  source                    = var.vcn_cidr
}

# Lab profile: open worker ingress from internet to avoid control-plane reachability issues
# while simulating environments quickly.
resource "oci_core_network_security_group_security_rule" "oke_nodes_ingress_any" {
  network_security_group_id = oci_core_network_security_group.oke_nodes.id
  direction                 = "INGRESS"
  protocol                  = "all"
  source                    = "0.0.0.0/0"
}

resource "oci_core_network_security_group_security_rule" "oke_nodes_egress_all" {
  network_security_group_id = oci_core_network_security_group.oke_nodes.id
  direction                 = "EGRESS"
  protocol                  = "all"
  destination               = "0.0.0.0/0"
}

resource "oci_load_balancer_load_balancer" "public_lb" {
  compartment_id = var.compartment_ocid
  display_name   = "${var.project_name}-public-lb"
  shape          = "flexible"
  subnet_ids     = [oci_core_subnet.public_edge.id]

  shape_details {
    minimum_bandwidth_in_mbps = var.lb_shape_min_mbps
    maximum_bandwidth_in_mbps = var.lb_shape_max_mbps
  }

  network_security_group_ids = [oci_core_network_security_group.lb.id]
  freeform_tags              = local.common_freeform_tags
}

resource "oci_load_balancer_backend_set" "public_bs" {
  name             = "${var.project_name}-public-bs"
  load_balancer_id = oci_load_balancer_load_balancer.public_lb.id
  policy           = "ROUND_ROBIN"

  health_checker {
    protocol = "HTTP"
    url_path = "/"
    port     = var.lb_backend_port
  }
}

resource "oci_load_balancer_rule_set" "security_headers" {
  load_balancer_id = oci_load_balancer_load_balancer.public_lb.id
  name             = "sec_headers"

  items {
    action = "ADD_HTTP_RESPONSE_HEADER"
    header = "Strict-Transport-Security"
    value  = "max-age=63072000; includeSubDomains; preload"
  }

  items {
    action = "ADD_HTTP_RESPONSE_HEADER"
    header = "X-Content-Type-Options"
    value  = "nosniff"
  }

  items {
    action = "ADD_HTTP_RESPONSE_HEADER"
    header = "X-Frame-Options"
    value  = "DENY"
  }

  items {
    action = "ADD_HTTP_RESPONSE_HEADER"
    header = "Referrer-Policy"
    value  = "strict-origin-when-cross-origin"
  }
}

resource "oci_load_balancer_listener" "http_listener" {
  load_balancer_id         = oci_load_balancer_load_balancer.public_lb.id
  name                     = "http-80"
  default_backend_set_name = oci_load_balancer_backend_set.public_bs.name
  port                     = 80
  protocol                 = "HTTP"
  rule_set_names           = [oci_load_balancer_rule_set.security_headers.name]
}

resource "oci_load_balancer_backend" "public_lb_backends" {
  for_each         = toset(var.lb_backend_ips)
  load_balancer_id = oci_load_balancer_load_balancer.public_lb.id
  backendset_name  = oci_load_balancer_backend_set.public_bs.name
  ip_address       = each.value
  port             = var.lb_backend_port
  weight           = 1
}

resource "oci_waf_web_app_firewall_policy" "lb_policy" {
  count          = local.waf_is_active
  compartment_id = var.compartment_ocid
  display_name   = "${var.project_name}-waf-policy"
  freeform_tags  = local.common_freeform_tags
}

resource "oci_waf_web_app_firewall" "lb_waf" {
  count                      = local.waf_is_active
  backend_type               = "LOAD_BALANCER"
  compartment_id             = var.compartment_ocid
  display_name               = "${var.project_name}-waf"
  load_balancer_id           = oci_load_balancer_load_balancer.public_lb.id
  web_app_firewall_policy_id = oci_waf_web_app_firewall_policy.lb_policy[0].id
  freeform_tags              = local.common_freeform_tags
}

resource "oci_containerengine_cluster" "oke" {
  compartment_id     = var.compartment_ocid
  kubernetes_version = local.selected_k8s_version
  name               = "${var.project_name}-oke"
  vcn_id             = oci_core_vcn.main.id

  endpoint_config {
    is_public_ip_enabled = var.oke_is_api_endpoint_public
    subnet_id            = oci_core_subnet.public_edge.id
    nsg_ids              = [oci_core_network_security_group.oke_api.id]
  }

  options {
    service_lb_subnet_ids = [oci_core_subnet.public_edge.id]

    kubernetes_network_config {
      pods_cidr     = var.oke_pods_cidr
      services_cidr = var.oke_services_cidr
    }
  }

  freeform_tags = local.common_freeform_tags
}

resource "oci_containerengine_node_pool" "oke_np" {
  cluster_id         = oci_containerengine_cluster.oke.id
  compartment_id     = var.compartment_ocid
  kubernetes_version = local.selected_k8s_version
  name               = "${var.project_name}-np"
  node_shape         = var.oke_node_shape
  node_metadata      = {}

  dynamic "node_shape_config" {
    for_each = contains(["VM.Standard.E4.Flex", "VM.Standard.E5.Flex", "VM.Standard.A1.Flex"], var.oke_node_shape) ? [1] : []
    content {
      ocpus         = var.oke_node_ocpus
      memory_in_gbs = var.oke_node_memory_gbs
    }
  }

  node_config_details {
    size = var.oke_node_pool_size

    dynamic "placement_configs" {
      for_each = local.selected_ads
      content {
        availability_domain = placement_configs.value.name
        subnet_id           = local.oke_node_subnet_id
      }
    }

    nsg_ids = [oci_core_network_security_group.oke_nodes.id]
  }

  node_source_details {
    source_type = local.selected_node_source.source_type
    image_id    = local.selected_node_source.image_id
  }

  freeform_tags = local.common_freeform_tags
}

resource "oci_apigateway_gateway" "gw" {
  count          = local.api_gateway_is_active
  compartment_id = var.compartment_ocid
  display_name   = "${var.project_name}-apigw"
  endpoint_type  = "PUBLIC"
  subnet_id      = oci_core_subnet.public_edge.id
}

resource "oci_apigateway_deployment" "gw_deploy" {
  count          = local.api_gateway_is_active
  compartment_id = var.compartment_ocid
  gateway_id     = oci_apigateway_gateway.gw[0].id
  display_name   = "${var.project_name}-apigw-deployment"
  path_prefix    = var.api_path_prefix

  specification {
    logging_policies {
      access_log {
        is_enabled = true
      }
      execution_log {
        is_enabled = true
        log_level  = "INFO"
      }
    }

    routes {
      path    = "/api/{path*}"
      methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]

      backend {
        type = "HTTP_BACKEND"
        url  = var.api_upstream_url
      }
    }
  }
}

resource "oci_database_autonomous_database" "adb" {
  count                       = local.adb_is_active
  compartment_id              = var.compartment_ocid
  db_name                     = var.adb_db_name
  display_name                = "${var.project_name}-adb"
  db_workload                 = var.adb_workload
  is_free_tier                = false
  cpu_core_count              = var.adb_cpu_core_count
  data_storage_size_in_tbs    = var.adb_data_storage_size_in_tbs
  admin_password              = var.adb_admin_password
  subnet_id                   = oci_core_subnet.private_data.id
  private_endpoint_label      = var.adb_private_endpoint_label
  nsg_ids                     = []
  whitelisted_ips             = []
  is_access_control_enabled   = false
  is_mtls_connection_required = true
  freeform_tags               = local.common_freeform_tags
}

resource "oci_objectstorage_bucket" "lab_bucket" {
  count          = local.bucket_is_active
  compartment_id = var.compartment_ocid
  namespace      = data.oci_objectstorage_namespace.ns.namespace
  name           = var.bucket_name
  access_type    = "NoPublicAccess"
  storage_tier   = "Standard"
  freeform_tags  = local.common_freeform_tags
}

resource "oci_identity_policy" "lab_admin_policy" {
  count          = local.policy_is_active
  compartment_id = var.tenancy_ocid
  name           = "${var.project_name}-admins-policy"
  description    = "Policy ampla para administrar o compartment do lab"
  statements = [
    "Allow group ${var.iam_admin_group_name} to manage all-resources in compartment id ${var.compartment_ocid}"
  ]
}
