require("dotenv").config();

const { Client, MessageEmbed } = require('discord.js');

const client = new Client();
const prefix = '!';
const fetch = require('node-fetch');
const request = require("request");

client.once('ready', () => {
	console.log('Ready!');
});


client.on('message', async message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    });

	if (command === 'init') {
        var query = '?q={"user_id":"'+message.author.id+'"}';
        var options = { method: 'GET',
        url: 'https://timur-f5b2.restdb.io/rest/timur-users'+query,
        headers: 
        { 'cache-control': 'no-cache',
        'x-apikey': '5bf2a89a136df1a649db8d5337adeb251dfed' } };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            let array = JSON.parse(body);
            if(array.length != 0) { // if array is not empty
                message.channel.send('Your account has already been activated');
            }
            else {
                var options = { method: 'POST',
                url: 'https://timur-f5b2.restdb.io/rest/timur-users',
                headers: 
                { 'cache-control': 'no-cache',
                'x-apikey': '5bf2a89a136df1a649db8d5337adeb251dfed',
                'content-type': 'application/json' },
                body: { user_id: message.author.id, wallet: 20 },
                json: true };

                request(options, function (error, response, body) {
                if (error) throw new Error(error);

                console.log(body);
                });
                message.channel.send('Your account has been created');
            }
        });
    }
    
    else if (command === 'wallet') {
        var wallet = 0;
        var options = { method: 'GET',
        url: 'https://timur-f5b2.restdb.io/rest/timur-users',
        headers: 
        { 'cache-control': 'no-cache',
        'x-apikey': '5bf2a89a136df1a649db8d5337adeb251dfed' } };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            console.log(body);
            let array = JSON.parse(body);
            var i = 0;
            for (i = 0; i < array.length; i++) {
                
                if(array[i].user_id === message.author.id) {
                    console.log(array[i].user_id +' =? '+ message.author.id);
                    wallet = array[i].wallet;
                }
            }
            message.channel.send('Your wallet contains: '+formatter.format(wallet));
        });
    }

    else if (command === 'transfer') {
        var query = '?q={"user_id":"'+message.author.id+'"}';
        var options = { method: 'GET',
        url: 'https://timur-f5b2.restdb.io/rest/timur-users'+query,
        headers: 
        { 'cache-control': 'no-cache',
        'x-apikey': '5bf2a89a136df1a649db8d5337adeb251dfed' } };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            let array = JSON.parse(body);
            if(array.length != 0) { // if array is not empty
                if(args[0] && args[1]) {
                    console.log(args[0] < 0);
                    if(!(args[0] < 0)){ // if inout is negative
                        const recipient = getUserFromMention(args[1]);

                        if(recipient.id === message.author.id) {
                            message.channel.send('https://i.kym-cdn.com/entries/icons/original/000/017/046/BptVE1JIEAAA3dT.jpg');
                            message.channel.send('You received a penalty of $50');
                            var currentWallet = array[0].wallet;
                            var SenderNewWallet = 0;
                            if(parseInt(currentWallet) < 50) {
                                SenderNewWallet = 0;
                            }
                            else {
                                SenderNewWallet = parseInt(currentWallet) - 50;
                            }
                            editWallet(array[0]._id, message.author.id, SenderNewWallet);
                        }
                        else {
                            var query = '?q={"user_id":"'+recipient+'"}';
                            var options = { method: 'GET',
                            url: 'https://timur-f5b2.restdb.io/rest/timur-users'+query,
                            headers: 
                            { 'cache-control': 'no-cache',
                            'x-apikey': '5bf2a89a136df1a649db8d5337adeb251dfed' } };
                            request(options, function (error, response, body) {
                                if (error) throw new Error(error);
                                let arrayRecipient = JSON.parse(body);
                                if(arrayRecipient.length != 0) { // if array is not empty
                            
                                    var amount = args[0];
                                    var currentWallet = array[0].wallet;
                                    if(amount <= currentWallet) { // is the amount in the wallet is more or equal to the amount entered
                                        
                                        // sender wallet update
                                        let SenderNewWallet = parseInt(currentWallet) - parseInt(amount);
                                        console.log('new wallet: $'+SenderNewWallet);
                                        console.log(array[0]._id);
                                        editWallet(array[0]._id, message.author.id, SenderNewWallet);
                                        // recipient wallet update
                                        let RecipientCurrentWallet = arrayRecipient[0].wallet;
                                        let RecipientNewWallet = parseInt(RecipientCurrentWallet) + parseInt(amount);
                                        console.log('new wallet: '+formatter.format(RecipientNewWallet));
                                        console.log(arrayRecipient[0]._id);
                                        editWallet(arrayRecipient[0]._id, recipient.id, RecipientNewWallet);
                                        message.channel.send(formatter.format(args[0])+' has been transferred to <@'+recipient+'>!');
                                    }
                                    else {
                                        console.log(amount +' / '+ currentWallet);
                                        message.channel.send('You cant spend that much, poor lil bitch ass motherfucker. \nYour wallet contains: '+formatter.format(currentWallet));
                                    }
                                }
                                else {
                                    message.channel.send('The recipient does not have an account!');
                                }
                            });
                        }
                    }
                    else {
                        message.channel.send('https://media1.tenor.com/images/744d8f272594e7e389c27f3bc2e730b7/tenor.gif');
                    }
                }
                else {
                    message.channel.send('No parameters given, type `!transfer [amount] [recipient]`');
                }
            }
            else {
                message.channel.send('You dont have an account');
            }
        });
    }

    else if (command === 'hey') {
        if (message.member.voice.channel) {
            const connection = await message.member.voice.channel.join();
            // Create a dispatcher
            const dispatcher = connection.play('door_open.wav',{ volume: 0.25 });

            dispatcher.on('start', () => {
            console.log('audio.mp3 is now playing!');
            });

            dispatcher.on('finish', () => {
            console.log('audio.mp3 has finished playing!');
            });

            // Always remember to handle errors appropriately!
            dispatcher.on('error', console.error);
        }
    }
    else if (command === 'listen') {
        const connection = await message.member.voice.channel.join();
        const fs = require('fs');

        // Create a ReadableStream of s16le PCM audio
        const audio = connection.receiver.createStream(message.author, { mode: 'pcm' });

        audio.pipe(fs.createWriteStream('user_audio'));
    }
    else if (command === 'eavesdrop') {
        if(args[0]) {
            const target = getUserFromMention(args[0]);
            console.log(target);
            const connection = await message.guild.member(target.id).voice.channel.join();
            const fs = require('fs');
    
            // Create a ReadableStream of s16le PCM audio
            const audio = connection.receiver.createStream(target, { mode: 'pcm' });
            message.channel.send(':disguised_face: eavesdropping '+target.username+'...');
            audio.pipe(fs.createWriteStream('audio_'+target.username+'_'+new Date()));
            // connection.disconnect();
            message.channel.send('Hmmmmmmm hehehe, voice recorded :hear_no_evil:');
        }
        else {
            message.channel.send('give argument!');
        }
    }

    else if (command === 'o') {
        // inside a command, event listener, etc.
        const exampleEmbed = new MessageEmbed()
        .setColor('#fff900')
        .setTitle(':black_joker: Initial bet: $5000.00')
        .setAuthor("Hammm 🍉's betting game", 'https://images-ext-2.discordapp.net/external/_R_rk5KOs11Za6XpfZWAtRsJAg3peCT3zUA5Phn2zsM/%3Fsize%3D1024/https/cdn.discordapp.com/avatars/95546623026794496/1ccd64db018525d43e5679ca5fa2e4e4.png')
        .setDescription('Double your bet to replace 1 card. You\ncan do this infinite times, but only non\that one card.')
        .addField('Card 1', ':diamonds: A', true)
        .addField('Card 2', ':hearts: 3', true)
        .addField('Card 3', ':diamonds: K', true)
        .addField('Card 4', ':spades: 7', true)
        .addField('\u200B', '\u200B', true)
        .addField('Payout:', '$$$', true)
        //.setImage('https://i.imgur.com/wSTFkRM.png')
        .setTimestamp(new Date().getTime())
        .setFooter('Timur', 'https://cdn.discordapp.com/app-icons/804464992786055189/66282e96d82b07b7acc3a8975c2f63ce.png?size=128');

        message.channel.send(exampleEmbed); 
    }

    else if (command == 'hammm') {
        
        if(args[0]) {
            var query = '?q={"user_id":"'+message.author.id+'"}';
            var options = { method: 'GET',
            url: 'https://timur-f5b2.restdb.io/rest/timur-users'+query,
            headers: 
            { 'cache-control': 'no-cache',
            'x-apikey': '5bf2a89a136df1a649db8d5337adeb251dfed' } };
        
            request(options, function (error, response, body) {
                if (error) throw new Error(error);
                let array = JSON.parse(body);
                if(array.length != 0) { // if the user exists
                    if(!(args[0] < 0)){ // if inout is negative
                        var currentWallet = array[0].wallet;
                        var bet = args[0];
                        var won = 0;
                        if(bet <= currentWallet) { // is the amount in the wallet is more or equal to the amount entered
                            function DrawCard() {
                                let card = {
                                    cardType: Math.floor(Math.random() * 4),
                                    cardNumber: Math.floor(Math.random() * 13)
                                };
                    
                                card.cardValue = CalculateCardValue(card);
                                card.cardString = GetCardString(card);
                    
                                return card;
                            }
                            function DrawCards() {
                                let cards = new Array();
                    
                                for (let i = 0; i < 4; i++) {
                                    cards[i] = DrawCard();
                                }
                    
                                return cards;
                            }
                            function GetCardString(card) {
                                let cardString;
                    
                                switch(card.cardType) {
                                    case 0:
                                        cardString = ":spades:"
                                    break;
                                    case 1:
                                        cardString = ":clubs:"
                                    break;
                                    case 2:
                                        cardString = ":diamonds:"
                                    break;
                                    case 3:
                                        cardString = ":hearts:"
                                    break;
                                }
                    
                                let cardNumber = card.cardNumber + 2;
                                if (cardNumber <= 10) return cardString + cardNumber;
                                if (cardNumber == 11) return cardString + "J";
                                if (cardNumber == 12) return cardString + "Q";
                                if (cardNumber == 13) return cardString + "K";
                                if (cardNumber == 14) return cardString + "A";
                            }
                            function CalculateCardValue(card) {
                                if (card.cardNumber == 0) 
                                    return 0;
                                if (card.cardNumber < 9)
                                    return card.cardNumber + 2;
                                if (card.cardNumber < 12)
                                    return 15;
                                else
                                    return 20;
                            }
                            function CalculateCardTotal(cards) {
                                let total = 0;
                                let hasTwo = false;
                                
                                cards.forEach(card => {
                                    if(card.cardValue == 0) {
                                        hasTwo = true;
                                    }
                    
                                    total += CalculateCardValue(card);
                                });
                    
                                return (hasTwo)?0:total;
                            }
                            function GetStringOfCards(cards) {
                                let string = "";
                    
                                cards.forEach(card => {
                                    string += card.cardString + " ";
                                });
                    
                                return string;
                            }
                            function CalculatePayoutMultiplier(total) {
                                if (total < 30) {
                                    return 0;
                                }
                    
                                if (total < 40) {
                                    return 1;
                                }
                    
                                return 2;
                            }
                            function GameLoop(bet, cards, changedCard) {
                                let choice = prompt(
                                    GetStringOfCards(cards) + "= " + CalculateCardTotal(cards) + 
                                    "     Bet: "            + bet + 
                                    "     Current Payout: " + bet * CalculatePayoutMultiplier(CalculateCardTotal(cards))
                                );
                    
                                if (choice < 0) {
                                    GameLoop(bet, cards, changedCard);
                                } else if (choice == 0) {
                                    alert("You win: " + bet * CalculatePayoutMultiplier(CalculateCardTotal(cards)));
                                } else if (choice <= 4) {
                                    if (changedCard == -1 || changedCard == choice) {
                                        bet *= 2;
                                        cards[choice-1] = DrawCard();
                                        changedCard = choice;
                                    } else {
                                        alert("You can only change the same card again.")
                                    }
                    
                                    GameLoop(bet, cards, changedCard);
                                } else {
                                    GameLoop(bet, cards, changedCard);
                                }
                            }
                            function gameFormat(Newbet) {
                                const bettingGame = new MessageEmbed()
                                .setColor('#fff900')
                                .setTitle(':moneybag: Current bet: '+formatter.format(Newbet))
                                .setAuthor("Hammm 🍉's betting game", 'https://images-ext-2.discordapp.net/external/_R_rk5KOs11Za6XpfZWAtRsJAg3peCT3zUA5Phn2zsM/%3Fsize%3D1024/https/cdn.discordapp.com/avatars/95546623026794496/1ccd64db018525d43e5679ca5fa2e4e4.png')
                                .setDescription('Double your bet to replace 1 card. You\ncan do this infinite times, but only\non that one card.')
                                .addField('Cards (1, 2, 3, 4)', "**"+GetStringOfCards(cards)+"**")
                                .addField('Current payout', "**"+formatter.format(Newbet * CalculatePayoutMultiplier(CalculateCardTotal(cards)))+"**")
                                .setTimestamp(new Date().getTime())
                                .setFooter('Timur', 'https://cdn.discordapp.com/app-icons/804464992786055189/66282e96d82b07b7acc3a8975c2f63ce.png?size=128');

                                return bettingGame;
                            }
                            let cards = DrawCards();
                            let changedCard = -1;
                            
                            const bettingGameInit = new MessageEmbed()
                            .setColor('#fff900')
                            .setTitle(':moneybag: Current bet: '+formatter.format(bet))
                            .setAuthor("Hammm 🍉's betting game", 'https://images-ext-2.discordapp.net/external/_R_rk5KOs11Za6XpfZWAtRsJAg3peCT3zUA5Phn2zsM/%3Fsize%3D1024/https/cdn.discordapp.com/avatars/95546623026794496/1ccd64db018525d43e5679ca5fa2e4e4.png')
                            .setDescription('Double your bet to replace 1 card. You\ncan do this infinite times, but only\non that one card.')
                            .addField('Cards (1, 2, 3, 4)', "**"+GetStringOfCards(cards)+"**")
                            .addField('Current payout', "**"+formatter.format(bet * CalculatePayoutMultiplier(CalculateCardTotal(cards)))+"**")
                            .setTimestamp(new Date().getTime())
                            .setFooter('Timur', 'https://cdn.discordapp.com/app-icons/804464992786055189/66282e96d82b07b7acc3a8975c2f63ce.png?size=128');
                    
                            var actualAuthor = message.author;
                            message.channel.send(bettingGameInit).then(function (message) {
                                message.react("1️⃣")
                                message.react("2️⃣")
                                message.react("3️⃣")
                                message.react("4️⃣")
                                message.react("✅")
                                // First argument is a filter function
                                message.awaitReactions((reaction, user) => user.id == actualAuthor.id,
                                { max: 1, time: 30000 }).then(collected => {
                                    if (collected.first().emoji.name == '✅') {
                                        message.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                                        message.send("<@"+actualAuthor.id+"> You win: **" + formatter.format(bet * CalculatePayoutMultiplier(CalculateCardTotal(cards)))+"**! :money_with_wings:");
                                    }
                                    else if (collected.first().emoji.name == '1️⃣') {
                                        message.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                                        message.react("1️⃣");
                                        message.react("✅");
                                        
                                        message.edit(gameFormat('1000000')); // debug purpose
                                    }
                                    else if (collected.first().emoji.name == '2️⃣') {
                                        message.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                                        message.react("2️⃣");
                                        message.react("✅");
                                    }
                                    else if (collected.first().emoji.name == '3️⃣') {
                                        message.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                                        message.react("3️⃣");
                                        message.react("✅");
                                    }
                                    else if (collected.first().emoji.name == '4️⃣') {
                                        message.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                                        message.react("4️⃣");
                                        message.react("✅");
                                    }
                                    else {
                                        //
                                    }
                                }).catch(() => {
                                        message.reply('No reaction after 30 seconds, betting canceled');
                                });
                            }).catch(function() {
                                //Something
                            });
                            
                            // GameLoop(bet, cards, changedCard);
                        }
                        else {
                            console.log(bet +' / '+ currentWallet);
                            message.channel.send('"Rich people have money, poor people have ...no money", loser. \nYour wallet contains: '+formatter.format(currentWallet));
                        }
                    }
                    else {
                        message.channel.send('https://media1.tenor.com/images/744d8f272594e7e389c27f3bc2e730b7/tenor.gif');
                    }
                }
                else {
                    message.channel.send('You dont have an account');
                }
            });
        }
        else {
            message.channel.send('No bet given, type `!hammmm [bet]`');
        }
    }

    else if (command === 'mizoe') {
        if(args[0]) {
            var query = '?q={"user_id":"'+message.author.id+'"}';
            var options = { method: 'GET',
            url: 'https://timur-f5b2.restdb.io/rest/timur-users'+query,
            headers: 
            { 'cache-control': 'no-cache',
            'x-apikey': '5bf2a89a136df1a649db8d5337adeb251dfed' } };
        
            request(options, function (error, response, body) {
                if (error) throw new Error(error);
                let array = JSON.parse(body);
                if(array.length != 0) { // if the user exists
                    if(!(args[0] < 0)){ // if inout is negative
                        var currentWallet = array[0].wallet;
                        var inputAmount = args[0];
                        var number = Math.floor(Math.random() * 1000);
                        var won = 0;
                        if(inputAmount <= currentWallet) { // is the amount in the wallet is more or equal to the amount entered
                            if(number > 950) {
                                won = number * inputAmount;
                                console.log(won);
                            }
                            else if(number > 800) {
                                // * 5
                                won = inputAmount * 5;
                                console.log(won);
                            }
                            else if(number > 700) {
                                // * 2
                                won = inputAmount * 2;
                                console.log(won);
                            }
                            else if(number > 400) {
                                // * 0.1
                                won = inputAmount * 0.1;
                                console.log(won);
                            }
                            else {
                                // nothing... or not
                                won = inputAmount * 0.001;
                                console.log(won);
                            }
                            message.channel.send('You won a total amount of '+formatter.format(won));

                            // sender wallet update
                            let nettoWin = parseInt(won) - parseInt(inputAmount);
                            console.log('won:'+won+' input:'+inputAmount+' ='+nettoWin);
                            let SenderNewWallet = parseInt(currentWallet) + parseInt(nettoWin);
                            editWallet(array[0]._id, message.author.id, SenderNewWallet);
                        }
                        else {
                            console.log(inputAmount +' / '+ currentWallet);
                            message.channel.send('You cant spend that much, poor lil bitch ass motherfucker. \nYour wallet contains: '+formatter.format(currentWallet));
                        }
                    }
                    else {
                        message.channel.send('https://media1.tenor.com/images/744d8f272594e7e389c27f3bc2e730b7/tenor.gif');
                    }
                }
                else {
                    message.channel.send('You dont have an account');
                }
            });
        }
        else {
            message.channel.send('No amount given, type `!mizoe [amount]`');
        }
    }

    else if (command === 'standard') {
        var query = '?q={"user_id":"'+message.author.id+'"}';
        var options = { method: 'GET',
        url: 'https://timur-f5b2.restdb.io/rest/timur-users'+query,
        headers: 
        { 'cache-control': 'no-cache',
        'x-apikey': '5bf2a89a136df1a649db8d5337adeb251dfed' } };
    
        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            let array = JSON.parse(body);
            if(array.length != 0) { // if the user exists
                if(args[0] && args[1]) {// if parameters are set
                    var amount = args[0];
                    var currentWallet = array[0].wallet;
                    if(amount <= currentWallet) { // is the amount in the wallet is more or equal to the amount entered
                        
                        // sender wallet update
                        let SenderNewWallet = parseInt(currentWallet) - parseInt(amount);
                        console.log('new wallet: $'+SenderNewWallet);
                        console.log(array[0]._id);
                        editWallet(array[0]._id, message.author.id, SenderNewWallet);
                    }
                    else {
                        console.log(amount +' / '+ currentWallet);
                        message.channel.send('You cant spend that much, poor lil bitch ass motherfucker. \nYour wallet contains: '+formatter.format(currentWallet));
                    }
                }
                else {
                    message.channel.send('No parameters given, type `!transfer [amount] [recipient]`');
                }
            }
            else {
                message.channel.send('You dont have an account');
            }
        });
    }

    function getUserFromMention(mention) {
        if (!mention) return;
    
        if (mention.startsWith('<@') && mention.endsWith('>')) {
            mention = mention.slice(2, -1);
    
            if (mention.startsWith('!')) {
                mention = mention.slice(1);
            }
    
            return client.users.cache.get(mention);
        }
    }

    function editWallet(id, userId, newWallet) {
        var request = require("request");

        var options = { method: 'PUT',
            url: 'https://timur-f5b2.restdb.io/rest/timur-users/'+id,
            headers: { 'cache-control': 'no-cache',
            'x-apikey': '5bf2a89a136df1a649db8d5337adeb251dfed',
            'content-type': 'application/json' },
            body: {_id: id, user_id: userId, wallet: newWallet},
            json: true };
        console.log(options.url+'  '+options.body);
        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            console.log(body);
        });
    }
});


client.login(process.env.DISCORDJS_BOT_TOKEN);