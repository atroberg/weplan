counter=0

while read line; do
	

	image1=`echo $line|cut -d ' ' -f 1`
	image2=`echo $line|cut -d ' ' -f 2`

	convert $image1 -resize 200x -quality 65% /var/www/weplan/images/destinations/200x/$counter.jpg || convert $image2 -resize 200x -quality 65% /var/www/weplan/images/destinations/200x/$counter.jpg 

	counter=$(($counter + 1))

done < photos
