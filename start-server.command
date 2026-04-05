#!/bin/bash
cd "$(dirname "$0")"
PORT=8765
echo ""
echo "  Адрес сайта: http://localhost:$PORT"
echo "  Окно не закрывайте. Ctrl+C — остановить сервер."
echo ""
(sleep 1 && open "http://localhost:$PORT" 2>/dev/null) &
python3 -m http.server "$PORT"
