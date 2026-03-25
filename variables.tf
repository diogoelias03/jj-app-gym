variable "tenancy_ocid" {
  description = "OCID da tenancy OCI"
  type        = string
}

variable "user_ocid" {
  description = "OCID do usuario OCI que possui a API key"
  type        = string
}

variable "fingerprint" {
  description = "Fingerprint da API key associada ao usuario OCI"
  type        = string
}

variable "private_key_path" {
  description = "Caminho local para a chave privada PEM da API key OCI"
  type        = string
}

variable "region" {
  description = "Regiao OCI para operacao do provider"
  type        = string
}

variable "compartment_ocid" {
  description = "Compartment OCID onde o lab sera criado"
  type        = string
}

variable "project_name" {
  description = "Prefixo dos recursos do lab"
  type        = string
  default     = "genai-lab"
}

variable "ad_count" {
  description = "Quantidade de Availability Domains para distribuicao do node pool"
  type        = number
  default     = 3
}

variable "vcn_cidr" {
  description = "CIDR da VCN"
  type        = string
  default     = "10.40.0.0/16"
}

variable "public_edge_subnet_cidr" {
  description = "CIDR da subnet publica (edge)"
  type        = string
  default     = "10.40.10.0/24"
}

variable "public_nodes_subnet_cidr" {
  description = "CIDR da subnet publica dedicada para nos OKE (fallback de lab)"
  type        = string
  default     = "10.40.40.0/24"
}

variable "private_app_subnet_cidr" {
  description = "CIDR da subnet privada para app/OKE"
  type        = string
  default     = "10.40.20.0/24"
}

variable "private_data_subnet_cidr" {
  description = "CIDR da subnet privada para banco/dados"
  type        = string
  default     = "10.40.30.0/24"
}

variable "service_label" {
  description = "DNS label do VCN"
  type        = string
  default     = "genailab"
}

variable "iam_admin_group_name" {
  description = "Grupo IAM com permissao administrativa do lab"
  type        = string
  default     = "administradores"
}

variable "create_lab_policy" {
  description = "Se true, cria policy ampla para o grupo IAM administrar o compartment"
  type        = bool
  default     = true
}

variable "lb_shape_min_mbps" {
  description = "Banda minima do Load Balancer flexivel (Mbps)"
  type        = number
  default     = 10
}

variable "lb_shape_max_mbps" {
  description = "Banda maxima do Load Balancer flexivel (Mbps)"
  type        = number
  default     = 50
}

variable "lb_backend_ips" {
  description = "Lista de IPs backend para o LB publico"
  type        = list(string)
  default     = []
}

variable "lb_backend_port" {
  description = "Porta do backend no LB publico"
  type        = number
  default     = 80
}

variable "waf_enabled" {
  description = "Se true, provisiona OCI WAF (novo) na frente do LB"
  type        = bool
  default     = true
}

variable "oke_is_api_endpoint_public" {
  description = "Se true, endpoint do OKE API sera publico"
  type        = bool
  default     = true
}

variable "oke_kubernetes_version" {
  description = "Versao desejada do Kubernetes. Se null, usa a mais recente da regiao."
  type        = string
  default     = null
}

variable "oke_node_shape" {
  description = "Shape do node pool OKE"
  type        = string
  default     = "VM.Standard.E4.Flex"
}

variable "oke_node_ocpus" {
  description = "OCPUs por no do node pool"
  type        = number
  default     = 2
}

variable "oke_node_memory_gbs" {
  description = "Memoria por no (GB) do node pool"
  type        = number
  default     = 16
}

variable "oke_node_pool_size" {
  description = "Quantidade inicial de nos no node pool"
  type        = number
  default     = 2
}

variable "oke_pods_cidr" {
  description = "CIDR dos pods no OKE (VCN-native)"
  type        = string
  default     = "10.244.0.0/16"
}

variable "oke_services_cidr" {
  description = "CIDR dos services no OKE (VCN-native)"
  type        = string
  default     = "10.96.0.0/16"
}

variable "oke_node_subnet_type" {
  description = "Subnet usada pelos workers do OKE: public ou private"
  type        = string
  default     = "private"

  validation {
    condition     = contains(["public", "private"], var.oke_node_subnet_type)
    error_message = "oke_node_subnet_type deve ser 'public' ou 'private'."
  }
}

variable "api_gateway_enabled" {
  description = "Se true, cria API Gateway e deployment de rotas"
  type        = bool
  default     = true
}

variable "api_upstream_url" {
  description = "URL upstream usada pelo API Gateway para encaminhar /api/{path*}"
  type        = string
  default     = "http://10.40.20.10"
}

variable "api_path_prefix" {
  description = "Path prefix do deployment no API Gateway"
  type        = string
  default     = "/"
}

variable "adb_enabled" {
  description = "Se true, cria Autonomous Database com private endpoint"
  type        = bool
  default     = false
}

variable "adb_db_name" {
  description = "Nome curto do banco ADB (ate 14 chars, letras/numeros)"
  type        = string
  default     = "GENAILABDB"
}

variable "adb_workload" {
  description = "Tipo de workload do ADB"
  type        = string
  default     = "OLTP"
}

variable "adb_cpu_core_count" {
  description = "Quantidade de OCPUs do ADB"
  type        = number
  default     = 1
}

variable "adb_data_storage_size_in_tbs" {
  description = "Storage do ADB em TB"
  type        = number
  default     = 1
}

variable "adb_admin_password" {
  description = "Senha admin do ADB (somente quando adb_enabled=true)"
  type        = string
  sensitive   = true
  default     = null
}

variable "adb_private_endpoint_label" {
  description = "Label do private endpoint do ADB"
  type        = string
  default     = "genaiadb"
}

variable "create_object_storage_bucket" {
  description = "Se true, cria bucket de suporte ao lab"
  type        = bool
  default     = true
}

variable "bucket_name" {
  description = "Nome do bucket para dados do lab"
  type        = string
  default     = "genai-lab-data"
}
