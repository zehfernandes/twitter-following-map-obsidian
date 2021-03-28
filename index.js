const Twit = require('twit')
const fs = require("fs")


const searchHandler = "zehf"

var T = new Twit({
	consumer_key: '',
  	consumer_secret: '',
	access_token: '',
	access_token_secret: ''
})

let createDictionary = false
let dictUsers = createDictionary ? [] : getCache('userDictionary')

async function loopFollowers() {  
 	let followers = getCache(searchHandler) ? 
		getCache(searchHandler) : 
		await T.get('friends/ids', { screen_name: searchHandler, stringify_ids: true })

	writeCache(searchHandler, followers)

	const ids = followers.data.ids

	for (var i = 0; i < ids.length; i++) {
		let userID = ids[i]

		let handle = await getUserHandle(userID)
		
		console.log("DEBUG", i, handle)
		
		try {
			let userFollowing = getCache(handle) ? 
				getCache(handle) :
				await T.get('friends/ids', { screen_name: handle, stringify_ids: true })

				writeCache(handle, userFollowing)

				// filter the list
				let isMutal = userFollowing.data.ids.filter(id => id == "40301836").length > 0 ? true : false
				let filterList = userFollowing.data.ids.filter(id => ids.includes(id))

				let tags = createTagList(isMutal)
				createDataStructure(handle, filterList, tags)

		} catch(e) {
			console.log("---------------")
			console.log(e)
			await delay(900000, true);
			console.log("---------------")
			i = i - 1
			continue;
   		}
	}

	if (createDictionary)
		writeCache("userDictionary", dictUsers)
	
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