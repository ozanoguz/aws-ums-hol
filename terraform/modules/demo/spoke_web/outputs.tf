output "url" {
  value = "http://${aws_eip.web.public_ip}"
}
output "private_ip" {
  value = local.collector_ip
}
output "instance_id" {
  value = aws_instance.web.id
}
output "spoke_vpc_id" {
  value = aws_vpc.demo.id
}
output "workload_subnet_id" {
  value = aws_subnet.workload.id
}
output "fortimanager_cli_template" {
  description = "Apply through FortiManager to the two-arm FortiGate UMS group. Reserve syslogd2 for this demo."
  value       = <<-CLI
    config router static
        edit 190
            set dst ${local.collector_ip} 255.255.255.255
            set device "port2"
            set dynamic-gateway enable
        next
    end
    config log syslogd2 setting
        set status enable
        set server "${local.collector_ip}"
        set mode udp
        set port 5514
        set format default
        set interface-select-method specify
        set interface "port2"
    end
    config log syslogd2 filter
        set severity information
        set forward-traffic enable
    end
  CLI
}
