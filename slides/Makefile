FILE = index

all:
	pandoc -t revealjs -s $(FILE).md -o $(FILE).html --filter pandoc-citeproc --slide-level=2 --highlight-style kate

clean:
	rm *.html

