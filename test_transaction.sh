TXID="e6d4a270b7494547823bb13823a54df8"
APP_ID="app_d574953a1565443400d391a6822124e7"
API_KEY="api_a2V5Xzc3ZTcxNGY0YTMzMDg0MTE0ZmZhNzQwZjU5ODdmZWQ5OnNrXzI4NTc0YzkzN2E0Y2QxZTAxMjA3ZmRjNmQyZjk2NGFmNzlmYTc5ODAyNzQ2YjkwNQ"
URL="https://developer.worldcoin.org/api/v2/minikit/transaction/$TXID?app_id=$APP_ID&type=payment"
echo $URL
curl -X GET $URL