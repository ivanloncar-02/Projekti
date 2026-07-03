#!/bin/bash
# Skripta za kreiranje virtualnog TAP sučelja na Linuxu za spajanje GNS3 s Flaskom
sudo ip tuntap add mode tap tap0
sudo ip addr add 192.168.122.1/24 dev tap0
sudo ip link set dev tap0 up
echo "TAP sučelje tap0 je podignuto na IP: 192.168.122.1"
