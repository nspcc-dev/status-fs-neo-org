all:
	rm -rf output
	docker build -t app .
	docker create -ti --name app app bash
	docker cp app:/app/build output
	docker rm -f app