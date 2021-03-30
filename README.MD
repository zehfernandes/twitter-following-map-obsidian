# Twitter Following Map with Obsidian

Find if the people you follow also follow each other. [Read more](https://twitter.com/zehf/status/1375523104974327810)

![](https://pbs.twimg.com/media/ExbWH78W8AAield?format=jpg&name=4096x4096)

## Instructions

1 - Install the dependecies.

```
npm i --save
```

2 - Get twitter creditals at https://developer.twitter.com/en/portal/projects-and-apps and update the `index.js`.

```js
var T = new Twit({
  consumer_key: "", // API key
  consumer_secret: "", // API key secret
  access_token: "",
  access_token_secret: "",
});
```

3 - Run the script and wait until complete. 
```js
node index.js
```

4 - Open the `valt` folder with [Obsidian](https://obsidian.md/)


## Important

The Twitter API has a low rate-limited, so depending on how many people you follow could take a longer time. The script handles it in two ways:

1. creating a `cache` folder, so when you rerun the script will skip the accounts that already visited
2. Automatctly waiting 15 minutes after receive a rate-limited error from the API.
