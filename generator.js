
let testCase = 0;

function rand(n) {

  return Math.floor(Math.random() * n);

}

function generateTime(after) {

  return Math.floor((Math.random() ** 5 / 12) * (100000000 - after) + after);
  
}

function toTimestamp(timestamp) {

  let year, month, day, hour, minute, second;
  
  second = timestamp % 100; timestamp = Math.floor(timestamp / 100);
  minute = timestamp % 100; timestamp = Math.floor(timestamp / 100);
  hour   = timestamp % 100; timestamp = Math.floor(timestamp / 100);
  day    = timestamp % 100; timestamp = Math.floor(timestamp / 100);
  month  = timestamp % 100; timestamp = Math.floor(timestamp / 100);
  year   = timestamp % 100;

  return `${year < 10 ? "0" : ""}${year}:${month < 10 ? "0" : ""}${month}:${day < 10 ? "0" : ""}${day}:${hour < 10 ? "0" : ""}${hour}:${minute < 10 ? "0" : ""}${minute}:${second < 10 ? "0" : ""}${second}`;
  
}

function padPIN(PIN) {
  
  let s = `000000${PIN}`;
  return s.substring(s.length - 6);
  
}

function generateUser(users) {

  return {
    timestamp: toTimestamp(generateTime(0)),
    name: `person${rand(100)}`,
    PIN: padPIN(rand(1000000)),
    balance: rand(10000),
    IPs: []
  };
  
}

function generateRegistrationFile(users) {

  let output = "";
  
  for (let i = 0; i < users.length; i++)
    output += `${users[i].timestamp}|${users[i].name}|${users[i].PIN}|${users[i].balance}\n`;

  return output;

}

function generateIP() {

  return `${rand(255)}.${rand(255)}.${rand(255)}.${rand(255)}`;
  
}

function generateLoginCommand(users) {

  let user = users[rand(users.length)];
  let PIN = Math.random() < 0.8 ? user.PIN : padPIN(rand(1000000));
  let IP = generateIP();

  user.IPs.push(IP);

  return `login ${user.name} ${PIN} ${IP}`;
  
}

function generateLogoutCommand(users) {

  let user, IP;

  // success:
  if (Math.random() < 0.8) {
      
    let loggedIn = [];

    for (let i = 0; i < users.length; i++)
      if (users[i].IPs.length)
        loggedIn.push(i);

    if (loggedIn.length == 0) {

      user = users[rand(users.length)];
      IP = generateIP();
        
    } else {

      user = users[loggedIn[rand(loggedIn.length)]];
      let IPi = rand(user.IPs.length);
      IP = user.IPs[IPi];

      user.IPs.splice(IPi, 1);
      
    }

  // fail:
  } else {

    user = users[rand(users.length)];
    IP = generateIP();
    
  }

  return `out ${user.name} ${IP}`;
  
}

function generatePlaceCommand(users, execTimes, lastTime) {

  let userA, userB, IP;

  // success:
  if (Math.random() < 0.8) {
      
    let loggedIn = [];

    for (let i = 0; i < users.length; i++)
      if (users[i].IPs.length)
        loggedIn.push(i);

    if (loggedIn.length == 0) {

      userA = users[rand(users.length)];
      IP = generateIP();
        
    } else {

      userA = users[loggedIn[rand(loggedIn.length)]];
      let IPi = rand(userA.IPs.length);
      IP = userA.IPs[IPi];

      userA.IPs.splice(IPi, 1);
        
    }

  // fail:
  } else {

    userA = users[rand(users.length)];
    IP = generateIP();
      
  }
  
  userB = users[rand(users.length)];

  lastTime = generateTime(lastTime);
  let exec = generateTime(lastTime);

  execTimes.push(exec + 5000000);

  let amount = Math.abs(rand(userA.balance * 1.2));

  userA.balance -= amount;
  userB.balance += amount;

  return `place ${toTimestamp(lastTime + 5000000)} ${IP} ${userA.name} ${userB.name} ${amount} ${toTimestamp(exec + 5000000)} ${Math.random() < 0.5 ? "o" : "s"}`;
  
}

function generateCommandsFile(users, execTimes, lastTime) {

  let output = `# Test Case ${testCase}\n${generateLoginCommand(users)}`;

  for (let i = 0; i < rand(5) + 15; i++) {

    if (Math.random() < 0.7)
      output += `\n${generatePlaceCommand(users, execTimes, lastTime)}`;
    else if (Math.random() < 0.7)
      output += `\n${generateLoginCommand(users)}`;
    else
      output += `\n${generateLogoutCommand(users)}`;
      
  }

  return `${output}`;
  
}

function generateListQuery(execTimes) {

  let ia = rand(execTimes.length - 1);
  let ib = Math.min(ia + rand(execTimes.length - ia - 1) + 1, execTimes.length - 1);

  return `l ${toTimestamp(execTimes[ia])} ${toTimestamp(execTimes[ib])}`;
  
}

function generateRevenueQuery(execTimes) {

  let ia = rand(execTimes.length - 1);
  let ib = Math.min(ia + rand(execTimes.length - ia - 1) + 1, execTimes.length - 1);

  return `r ${toTimestamp(execTimes[ia])} ${toTimestamp(execTimes[ib])}`;
  
}

function generateHistoryQuery(users) {

  return `h ${users[rand(users.length)].name}`;
  
}

function generateSummaryQuery(execTimes) {

  return `s ${toTimestamp(execTimes[rand(execTimes.length)])}`;
  
}

function generateQueriesFile(users, execTimes) {

  let output = `${generateListQuery(execTimes)}\n`;

  for (let i = 0; i < rand(5) + 5; i++) {

    if (Math.random() < 0.25)
      output += `${generateListQuery(execTimes)}\n`;
    else if (Math.random() < 0.33)
      output += `${generateRevenueQuery(execTimes)}\n`;
    else if (Math.random() < 0.5)
      output += `${generateHistoryQuery(users)}\n`;
    else
      output += `${generateSummaryQuery(execTimes)}\n`;
      
  }

  return output;

  
}

function userExists(users, name) {

  for (let i = 0; i < users.length; i++)
    if (users[i].name === name)
      return true;

  return false;

}

function generateTestCase() {

  testCase++;

  let users = [];
  for (let i = 0; i < rand(3) + 3; i++) {

    let user = generateUser(users);
    if (!userExists(users, user.name))
      users.push(user);

  }

  let execTimes = [];
  let lastTime = 0;

  let registrationFile = generateRegistrationFile(users);
  let commandsFile = generateCommandsFile(users, execTimes, lastTime);

  execTimes.sort(function(a, b) { return a - b });

  let queriesFile = generateQueriesFile(users, execTimes);

  return {
    registrationFile,
    commandsFile,
    queriesFile
  };

}