docker stop node_streaming
docker rm node_streaming
docker build -t node-app .
docker run --name node_streaming -p 3000:3000 -v /media/my_ftp/Proyecto_vclip/raw_videos:/videos node-app
