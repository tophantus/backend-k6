# Hướng dẫn chạy K6 với Grafana & InfluxDB

## 1️⃣ Chuẩn bị
- Đảm bảo **port 8086** (InfluxDB) và **port 3000/3001** (Grafana) chưa bị chiếm
## Khởi động backend
- Vào thư mục chứa docker compose của backend "/mern-ecommerce"
`docker-compose up -d`
## Khởi động InfluxDB & Grafana
- Vào thư mục chứa docker compose của k6, influxdb và grafana "/k6-tests"
`docker-compose up -d influxdb grafana`

## Kết nối Grafana với InfluxDB
1. Truy cập Grafana: [http://localhost:3001](http://localhost:3001)  
2. Đăng nhập với **User / Password**: `admin` / `admin`  
3. Vào **Configuration → Data Sources → Add data source → InfluxDB**  
4. Điền thông tin:
   - **URL**: `http://influxdb:8086`
   - **Database**: `k6`  
5. Nhấn **Save & Test** → nếu thành công, sẽ hiện **“Data source is working”**

## Xem biểu đồ trên Grafana

1. Vào **Dashboard → Create Dashboard → Import Dashboard**  
2. Nhập **ID: 2587**, nhấn **Load**  
3. Chọn **Data Source** vừa tạo → nhấn **Import**

## Chạy script K6
1. Chỉnh sửa **tên script** và **file summary** trong file `.env`

K6_SCRIPT=tests/product/product-get-item.test.js

K6_SUMMARY=metrics/product/get-item-summary.json

2. Chỉnh sửa **stage** trong script K6 tùy theo mục đích test  
3. Chạy lệnh:

`docker compose run --rm k6`

Xem thông số và đồ thị trên Grafana Dashboard hoặc trong file summary
