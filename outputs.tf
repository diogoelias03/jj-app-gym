output "vcn_id" {
  value = oci_core_vcn.main.id
}

output "public_edge_subnet_id" {
  value = oci_core_subnet.public_edge.id
}

output "private_app_subnet_id" {
  value = oci_core_subnet.private_app.id
}

output "private_data_subnet_id" {
  value = oci_core_subnet.private_data.id
}

output "public_nodes_subnet_id" {
  value = oci_core_subnet.public_nodes.id
}

output "oke_cluster_id" {
  value = oci_containerengine_cluster.oke.id
}

output "oke_node_pool_id" {
  value = oci_containerengine_node_pool.oke_np.id
}

output "public_lb_ip_addresses" {
  value = [for ip in oci_load_balancer_load_balancer.public_lb.ip_address_details : ip.ip_address]
}

output "api_gateway_hostname" {
  value       = var.api_gateway_enabled ? oci_apigateway_gateway.gw[0].hostname : null
  description = "Hostname publico do API Gateway"
}

output "adb_id" {
  value       = var.adb_enabled ? oci_database_autonomous_database.adb[0].id : null
  description = "OCID do Autonomous Database quando habilitado"
}

output "object_storage_bucket" {
  value       = var.create_object_storage_bucket ? oci_objectstorage_bucket.lab_bucket[0].name : null
  description = "Bucket criado para o lab"
}

output "waf_web_app_firewall_id" {
  value       = var.waf_enabled ? oci_waf_web_app_firewall.lb_waf[0].id : null
  description = "OCID do OCI WAF criado na frente do Load Balancer"
}
