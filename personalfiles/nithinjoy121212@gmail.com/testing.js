//For continuous English
var a = `
4. Who was appointed to save Israel after Abimelech?
5. The Lord has said that who among the offspring of Jephun'neh the Kenizzite will come to the land of Canaan?
6. Which of the men sent by Moses to spy out the land of Canaan stood courageously?
7. After how many years did St.Paul visit Jerusalem the second time?
8. Whoever sows to please their flesh, will reap _; whoever sows to please the Spirit, will reap_.
9. To whom does God not give wisdom and understanding? 
10. Why is it necessary to perfect wisdom?
11. Which city was Philip from?
12. What did King Solomon use to make for himself a portable throne?
13. "God is love" which chapter and which verse?
14. Whom did the king appoint to destroy the wise men of Babylon?
15. Where does the word of the Lord land?
16. Who was the main angel who argued with the devil over Moses' body?
17. What is the total number of gems mentioned in Revelation Chapter 21?
18. How are God's judgments?
19. To not fall into temptation, what should you do?
20. What vow did Samson keep from his birth?

`


var b = a.replace(/[^a-z0-9 ]/gi, '').replace(/Q/g, '');
console.log(b);

c = b.split(/[0-9]/g)

let n = c.length
console.log(c)
for (i = 0; i < n; i++) {
        if (c[i]) window.open('http://google.com/search?q=' + c[i] + "")
}




//For english, kannada, malayalam mix
var a = ``


var b = a.replace(/[^a-z _]/gi, '').replace(/Q/g, '');

console.log(b);

c = b.split("  ")
let n = c.length
console.log(c)
for (i = 0; i < n - 1; i++) {
        if (c[i]) window.open('http://google.com/search?q=' + c[i] + " in numbers")
        if (c[i]) window.open('http://google.com/search?q=' + c[i] + " in luke")
}



`


1)Kingdom of God
2)
3)
4)
5)Caleb
6)
7)
8)
9)
10)
11)
12)
13)
14)
15)
16)St. Michael
17)12
18)
19)Pray
20)He will not drink wine and cut his hair



























Name:Nithin K Joy
House Name:Kelamkunnel
Parish:St. Mary's church, Kermai
`