FILE = index

all:
	pandoc -t revealjs -s -o $(FILE).html $(FILE).md \
		--css=style.css \
		--slide-level=2 \

clean:
	rm *.html

