#!/usr/bin/env bash
cd "$(dirname "$0")"
clear
echo "═══════════════════════════════════════════════════"
echo "  UGCLab — يتم التشغيل..."
echo "═══════════════════════════════════════════════════"
echo ""
bash "$(dirname "$0")/start.sh"
read -p "اضغط Enter للإغلاق..."
