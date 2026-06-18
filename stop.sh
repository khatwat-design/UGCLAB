#!/usr/bin/env bash
pkill -f "artisan serve" 2>/dev/null && echo "Backend stopped" || echo "Backend not running"
pkill -f "next dev" 2>/dev/null && echo "Frontend stopped" || echo "Frontend not running"
echo "Done"
