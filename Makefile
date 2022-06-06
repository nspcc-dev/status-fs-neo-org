all:
	rm -rf output
	docker build -t app .
	docker create -ti --name app app bash
	docker cp app:/app/build output
	docker rm -f app


release: all
	@rm -rf release
	@mkdir release
	@tar -czvf release/neofs-web-stat.tar.gz -C output .
	@cp get_webstat_metrics.py release
