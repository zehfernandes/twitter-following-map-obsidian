const Twit = require('twit')
const fs = require("fs")
require('dotenv').config()

const searchHandler = "zehf"
let searchHandlerID = "" // The script will find this for you

var T = new Twit({
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
	access_token: process.env.TWITTER_ACCESS_TOKEN,
	access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
})

let createDictionary = true
let dictUsers = createDictionary ? [] : getCache('userDictionary')

async function loopFollowers() {  
	if (createDictionary)
		console.log("\nCreating Dictionary\n------------------------------------------")

 	let followers = getCache(searchHandler) ? 
		getCache(searchHandler) : 
		await T.get('friends/ids', { screen_name: searchHandler, stringify_ids: true })

	
	let userInfos = getCache(searchHandlerID) ? 
		getCache(searchHandlerID) : 
		await T.get('users/lookup', { screen_name: searchHandler })
	
	searchHandlerID = userInfos.data[0].id

	writeCache(searchHandler, followers)
	const ids = followers.data.ids

	for (var i = 0; i < ids.length; i++) {
		let userID = ids[i]

		try {
			let handle = await getUserHandle(userID)
		
			console.log("DEBUG", i, handle)

			if (createDictionary)
				continue

			let userFollowing = getCache(handle) ? 
				getCache(handle) :
				await T.get('friends/ids', { screen_name: handle, stringify_ids: true })

				writeCache(handle, userFollowing)

				// filter the list
				let isMutal = userFollowing.data.ids.filter(id => id == searchHandlerID).length > 0 ? true : false
				let filterList = userFollowing.data.ids.filter(id => ids.includes(id))

				let tags = createTagList(isMutal)
				createDataStructure(handle, filterList, tags)

		} catch(e) {
			console.log("---------------")
			console.log(e)
			// Error code for Rate limit
			if (e.code == 88) { 
				await delay(900000, true);
				console.log("---------------")
				i = i - 1
			}
			continue;
   		}
	}

	if (createDictionary) { 
		writeCache("userDictionary", dictUsers)

		createDictionary = false
		console.log("\nStarting collecting followers\n------------------------------------------")
		loopFollowers()
	}
	
}

loopFollowers()

// -------------------------------------------------------
function getCache(filename) { 
	if (fs.existsSync(`cache/${filename}.json`)) { 
		let data = fs.readFileSync(`cache/${filename}.json`, 
            {encoding:'utf8', flag:'r'}); 
		return JSON.parse(data)
	} else { 
		return false
	}
}  

function writeCache(filename, content) { 
	if (!fs.existsSync(`cache/${filename}.json`)) { 
		fs.writeFileSync(`cache/${filename}.json`, JSON.stringify(content), function (err) {
	  		if (err) return console.log(err);
		});
	} 
}

async function getUserHandle(id) {
	try {
		let userinfo = getCache(id) ? 
			getCache(id) : 
			await T.get('users/lookup', { user_id: id })

		writeCache(id, userinfo)
		
		if (createDictionary) { 
			dictUsers.push({
				id: id,
				screen_name: userinfo.data[0].screen_name
			})
		}

		return userinfo.data[0].screen_name
	} catch(e) { 
		throw e;
		return false
	} 
}

function createDataStructure(userHandle, followers, tags) {
	let txt = `# ${userHandle}\n\n`
	txt += `<iframe src="https://twitter.com/${userHandle}" height="500", width="400"></iframe>\n\n`

	for (var i = 0; i < followers.length; i++) {
		let userID = followers[i]
		let handle = dictUsers.filter(obj => obj.id === userID)
		txt += `- [[${handle[0].screen_name}]]\n`
	} 

	txt += tags

	fs.writeFileSync(`valt/${userHandle}.md`, txt, function (err) {
  		if (err) return console.log(err);
	});

	console.log(`✅ ${userHandle} file created`);
}

function createTagList(isMutal) { 
	let tags = "\n---\ntags: "

	if(isMutal) { 
		tags += " #friends"
	}

	return tags
}

async function delay(timer, print) {
  return new Promise((resolve, reject) => {
    if (print) console.log(`Waiting ${timer}ms`);

    setTimeout(function () {
      resolve(true);
    }, timer);
  });
}