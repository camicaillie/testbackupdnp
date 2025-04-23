#!/bin/bash

# Create fonts directory if it doesn't exist
mkdir -p assets/fonts

# Download font files
cd assets/fonts

# Download Mulish
curl -o Mulish-Regular.woff2 "https://fonts.gstatic.com/s/mulish/v12/1Ptyg83HX_SGhgqO0yLcmjzUAuWexZNR8aevHw.woff2"

# Download Poppins
curl -o Poppins-Regular.woff2 "https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrJJfecg.woff2"
curl -o Poppins-Medium.woff2 "https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLGT9Z1xlFQ.woff2"
curl -o Poppins-SemiBold.woff2 "https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLEj6Z1xlFQ.woff2"
curl -o Poppins-Bold.woff2 "https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLCz7Z1xlFQ.woff2"
curl -o Poppins-ExtraBold.woff2 "https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLDD4Z1xlFQ.woff2"

cd ../..

echo "Google Fonts files downloaded successfully!" 