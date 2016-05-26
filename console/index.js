'use strict';

const smoochBot = require('smooch-bot');
const MemoryStore = smoochBot.MemoryStore;
const MemoryLock = smoochBot.MemoryLock;
const Bot = smoochBot.Bot;
const Script = smoochBot.Script;
const StateMachine = smoochBot.StateMachine;

class ConsoleBot extends Bot {
    constructor(options) {
        super(options);
    }

    say(text) {
        return new Promise((resolve) => {
            console.log(text);
            resolve();
        });
    }
}

const script = new Script({

    start: {
       receive: (bot) => {
            return bot.say('Hi welcome to fitblink!')
                .then(() => bot.say('I am fitbot, I will assist you in finding the right solution for you based on your fitness or health needs'))
                .then(() => bot.say('Let\'s get to know each other better'))
                .then(() => 'askName');
        }
    },

    askName: {
        prompt: (bot) => bot.say('What\'s your name'),
        receive: (bot, message) => {
            const name = message.text.trim();
            bot.setProp('name', name);
            return bot.say(`Hi ${name}`)
                .then(() => bot.say('Can I get your'))
                .then(() => 'age');
        }
    },

    age: {
        prompt: (bot) => bot.say('Age (in yrs)'),
        receive: (bot, message) => {
            const age = Number(message.text.trim());
            return bot.setProp('age', age)
               .then(() => 'gender');
        }
    },

    gender: {
        prompt: (bot) => bot.say('Gender'),
        receive: (bot, message) => {
            const gender = message.text.trim();
            return bot.setProp('gender', gender)
                .then(() => 'height');
        }
    },

    height: {
        prompt: (bot) => bot.say('Height (in cm)'),
        receive: (bot, message) => {
            const height = Number(message.text.trim());
            return bot.setProp('height', height)
               .then(() => 'weight');
        }
    },

    weight: {
        prompt: (bot) => bot.say('Weight (in kg)'),
        receive: (bot, message) => {
            const weight = Number(message.text.trim());
            return bot.setProp('weight', weight)
                 .then(() => 'phone');
        }
    },

    phone: {
        prompt: (bot) => bot.say('Phone Number'),
        receive: (bot, message) => {
            var bmi = 0;
            const number = message.text.trim();
            bot.setProp('number', number);
            return bot.say('The details are only for my eyes!! Your secret is safe with me ;)')
                .then(() => bot.say('Let me check your bmi!!')).then(() => bot.getProp('weight').then((weight) => bot.getProp('height').then((height) => {
                bmi = (weight*100*100)/(height*height);
            }))).then(() => bot.setProp('bmi', bmi))
                .then(() =>
                bot.say(`Your bmi is ${bmi}`)).then(() => {
                  if(bmi >=18.5 && bmi <= 24.9)
                    return bot.say('You’re already fit, I wonder if you need me, Ah! But I can show you tricks which can help maintain this already good health')
                           .then(() => bot.say('Before I do that, let me ask if you have any specific issue like Migraine, Back pain,or any injury that I should know about?'))
                           .then(() => 'issues');
                  else 
                    return bot.say(`Well, we got your back, Looks like we have just the right set of experts and activities which can help you get your BMI back in normal zone`).
                      then(() => bot.say('It’s time to find you a personal trainer, this number will be tamed, that’s our commitment.'))
                        .then(() => 
                            bot.say('Would you like to continue your journey using Gym workouts and diet? Just Diet? Or how about some Yoga?'))
                        .then(() => 'choice');
          });
        }
    },

    issues: {

        receive: (bot, message) => {
                                        const issues = message.text.trim();
                                        bot.setProp('issues', issues);
                                        if(issues == 'yes' || issues == 'Yes')
                                            return bot.say('Here are some experts on the same!!');
                                        else
                                            return bot.say('You must be doing something to stay that fit? Let’s me show you how we will track that for you').
                                              then(() => bot.say('We have a pedometer integrated for you, which can show you number of steps you’ve walked or run, distance, time when you were active and calories you’ve burnt doing those activity!!'))
                                              .then(() => 'pedometer');
                                    }
            
   },

   choice: {
    receive: (bot, message) => {
                                                        const type = message.text.trim();
                                                        bot.say('type', type);

                                                        if(type == 'Gym workouts')
                                                            return bot.say('You have chosen gym workouts!!');
                                                        else if(type == 'Diet')
                                                            return bot.say('You have chosen Diet!!');
                                                        else if(type == 'Yoga')
                                                            return bot.say('You have chosen Yoga!!');
                                                        else
                                                            return bot.say('Please choose correct option!!!');
                                                    }
 },

   pedometer: {
    prompt: (bot) => bot.say('Link to profile page!!')
   }

});

const userId = 'testUserId';
const store = new MemoryStore();
const lock = new MemoryLock();
const bot = new ConsoleBot({
    store,
    lock,
    userId
});

const stateMachine = new StateMachine({
    script,
    bot,
    userId
});

process.stdin.on('data', function(data) {
    stateMachine.receiveMessage({
        text: data.toString().trim()
    })
        .catch((err) => {
            console.error(err);
            console.error(err.stack);
        });
});
