import * as nodemailer from 'nodemailer';
import { User } from './models/User';
import { LoginData } from './models/LoginData';
import { LoginRes } from './models/LoginRes'
import { Lead } from './models/Lead'
import { Action } from './models/Action';
import { ChangePassword } from './models/ChangePassword';
import { Campaign } from './models/Campaign';
import { Commision } from './models/Commision';
import { NewUser } from './models/newUser';
import { Bilans } from './models/Bilans';

const UserMdb = require('./models/mongoDBModels/users');
const LeadMdb = require('./models/mongoDBModels/leads');
const ActionMdb = require('./models/mongoDBModels/leadsActions');
const CampaignMdb = require('./models/mongoDBModels/campaign');

//----------------POBIERANIE DANYCH DOTYCZACYCH AGENTA--------------------

//logowanie użytkownika
export async function getUserToLogin(loginData: LoginData): Promise<LoginRes> {
  const user = await UserMdb.find({nick: loginData.nick});
  
  if(user[0]!== undefined){
    const userToSend: User = {
      id: user[0].id,
      name: user[0].name,
      surname: user[0].surname,
      nick: user[0].nick,
      region: user[0].region,
      area: user[0].area,
      role: user[0].role,
      phone: user[0].phone,
      mail: user[0].mail,
      active:user[0].active
    };
    if(user[0].password === loginData.password && user[0].active){
      return ({loginError:false, loginUser: userToSend})
    }
    else
      return ( {loginError:true})
    }
  else
  return ( {loginError:true})
};

//odzyskiwanie hasła
export async function PasswordRecovery(login:{login:string}){
  const user = await UserMdb.find({nick: login.login});
  if(user[0] === undefined){
    return false
  }else{
    sendMail(user[0])
    return true  
  }
};

//funkcja do wysyłania maila z nowym hasłem
export async function sendMail(user:User) {
  let newPassword = 'NoweHaslo1234';
  await UserMdb.updateOne({nick: user.nick}, {password: newPassword});
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
      user:'maksymilian.dabrowski93@gmail.com',
      pass:'md8253maksior4'
    }
  });
  var mailOptions = {
    from: 'maksymilian.dabrowski93@gmail.com',
    to: `${user.mail}`,
    subject: 'Odyskiwanie hasła "Sklep z kontaktami dla Agentów"',
    html: `<p><b>Zmiana hasła użytkownka ${user.name +" "+  user.surname + "("+ user.nick +")"}</b></p><br>
    <p>Twoje nowe hasło to: <b>${newPassword}</b></p><br>
    <p>Ten mail mail pełni rolę informacyjną nie odpowaidaj na niego.</p>`
  };
  transporter.sendMail(mailOptions, function(error, info){
    if(error)
      console.log(error)
  });
};
  
//zmiana hasła użytkownika
export async function changePassword(changePassword: ChangePassword ): Promise<boolean> {
  const user = await UserMdb.find({nick: changePassword.nick});
  if(user[0].password === changePassword.password){
    await UserMdb.updateOne({nick: user[0].nick}, {password: changePassword.newPassword});
    return true
    }
  else
    return false
};

//pobranie użytkowników danego obszaru 
export async function getUsersByArea(structure:{area?: string}){
  let userObj: User[];
  //pobranie użytkowników danego obszaru 
  userObj = await UserMdb.find({area: structure.area});
  //pobranie użytkowników danego obszaru
  return filterUsers(userObj)
};

export async function getUsersAll(){
  let userObj: User[];
  //pobranie użytkowników danego obszaru 
    userObj = await UserMdb.find({});
  //pobranie użytkowników danego obszaru
  return filterUsers(userObj)  
};

//pobranie użytkowników danego regionu
export async function getUsersByRegion(structure:{region?:string}){
  let regionUsers = await UserMdb.find({region: structure.region});
  let usersWithoutPassword = [];
  regionUsers.forEach(user => {
    const userToSend: User = {
      id: user.id,
      name: user.name,
      surname: user.surname,
      nick: user.nick,
      region: user.region,
      area: user.area,
      role: user.role,
      phone: user.phone,
      mail: user.mail,
      active: user.active
    };
    usersWithoutPassword.push(userToSend)
  });
  let areas = [];
  let areasTabObj = [];
  usersWithoutPassword.forEach(el => {
    if(el.area !== ""){
      areas.push(el.area)
    }
  });
  const areasSet = [...new Set(areas)].sort();
  areasSet.forEach(area => {
    const areaDirector = usersWithoutPassword.find(el => el.area === area && el.role === "area");
    const areaAgents = usersWithoutPassword.filter(el => el.area === area && el.role === "agent");
    let areaObj = {
      area: area,
      director: areaDirector,
      agents: areaAgents
    };
    areasTabObj.push(areaObj)
  })
  return areasTabObj
};

//pobranie danych dyrektora wybranego obaszru
export async function  getDirectorByRegion(structure:{region?:string}){
  let direcorByRegion = await UserMdb.find({region: structure.region, role: "region"});
  return direcorByRegion[0];
};

//-----------------------------------------------------------------------------------------------------------------------------------------

//dodawanie nowego agenta
export async function addNewAgent(newAgent: NewUser){
  const agentTabLength = await UserMdb.find({});
  const agent_id = agentTabLength.length + 1;
  const nickCheck = newAgent.name.toLowerCase().substr(0,3) + newAgent.surname.toLowerCase();
  let nick = '';
  const userExist = await UserMdb.find({nick: nickCheck});;
  if(userExist[0] === undefined){
    nick = nickCheck
  }else{
    nick = nickCheck+agent_id
  };

  const newUser = new UserMdb ({
    id: agent_id,
    name: newAgent.name,
    surname: newAgent.surname,
    nick: nick,
    password: "test",
    region: newAgent.region,
    area: newAgent.area,
    role: 'agent',
    phone: newAgent.phone,
    mail: newAgent.mail,
    active: true,
  });

  newUser.save();
  return true
};
  
//dodawanie nowego nie agenta
export async function addNewNotAgent(changeAgent: NewUser){
  const agentTabLength = await UserMdb.find({});
  const agent_id = agentTabLength.length + 1;
  const nickCheck = changeAgent.name.toLowerCase().substr(0,3) + changeAgent.surname.toLowerCase();
  let nickNew = '';
  const userExist = await UserMdb.find({nick: nickCheck});;
  if(userExist === undefined){
    nickNew = nickCheck
  }else{
    nickNew = nickCheck+agent_id
  };
  await UserMdb.updateOne({nick: changeAgent.nick}, {
    name: changeAgent.name,
    surname: changeAgent.surname,
    phone: changeAgent.phone,
    mail: changeAgent.mail,
    password: "test",
    nick: nickNew
  });
  return true
};

//zmiana obszaru agenta
export async function changeAreaUser(changeAreaUser:{nick:string, newArea:string}){
  const northRegionAreas = ["Zachodnio-Pomorskie", "Pomorskie", "Warmińsko-Mazurskie", "Kujawsko-Pomorskie", "Podlaskie", "Lubuskie", "Wielkopolskie", "Mazowieckie" ];
  const southRegionAreas = ["Dolnośląskie", "Lubelskie", "Małopolskie", "Opolskie", "Podkarpackie", "Łódzkie", "Śląskie", "Świętokrzyskie"];
  let newRegion = "";
  if(northRegionAreas.includes(changeAreaUser.newArea)){
    newRegion = "Północ"
  }else if(southRegionAreas.includes(changeAreaUser.newArea)){
    newRegion = "Południe"
  };

  await UserMdb.updateOne({nick: changeAreaUser.nick}, {
    area: changeAreaUser.newArea,
    region: newRegion,
  });

  await LeadMdb.updateMany({owner: changeAreaUser.nick}, {
    area: changeAreaUser.newArea,
    region: newRegion,
  });
  
  await ActionMdb.updateMany({owner: changeAreaUser.nick}, {
    area: changeAreaUser.newArea,
    region: newRegion,
  });

  return true
};

//zmiana danych agenta
export async function changeDataUser(changeAgent: NewUser){ 
  await UserMdb.updateOne({nick: changeAgent.nick}, {
    name: changeAgent.name,
    surname: changeAgent.surname,
    phone: changeAgent.phone,
    mail: changeAgent.mail
  });
return true
};

//dezaktywacja agenta i przepięcie portela na innego agenta
export async function deactivateAgent(deactivatedData:{dectivatedAgent:string, agentToWalletChange: string }){

  await UserMdb.updateOne({nick: deactivatedData.dectivatedAgent}, {
    active: false
  });

  await LeadMdb.updateMany({owner: deactivatedData.dectivatedAgent}, {
    owner: deactivatedData.agentToWalletChange,
  });
  
  await ActionMdb.updateMany({owner: deactivatedData.dectivatedAgent}, {
    owner: deactivatedData.agentToWalletChange,
  });

  return true
};

//funkcja do filtrowania użytkowników tak aby nie wysyłać haseł użytkowników
function filterUsers (users:User[]){
  let usersToSend = [];
  users.forEach(user => {
    const userToSend: User = {
      id: user.id,
      name: user.name,
      surname: user.surname,
      nick: user.nick,
      region: user.region,
      area: user.area,
      role: user.role,
      phone: user.phone,
      mail: user.mail,
      active: user.active
    };
    usersToSend.push(userToSend)
  })
return usersToSend
};
  
//-----------------POBIERANIE DANYCH O KONTAKTACH DO KUPIENIA ------------------

//kontakty to kupienia wszystkie 
export async function getLeadsToBuy(): Promise<Lead[]>{
  let leadObj = await LeadMdb.find({owner: ""});
  return filterLeadToBuy(leadObj)
};

//kontakty to kupienia z podanego Region
export async function getLeadsToBuyByRegion(region: string): Promise<Lead[]>{
  let leadObj = await LeadMdb.find({owner: "", region: region});
  return filterLeadToBuy(leadObj)
};

//kontakty to kupienia z podanego Area
export async function getLeadsToBuyByArea(area: string): Promise<Lead[]>{
  let leadObj = await LeadMdb.find({owner: "", area: area});
  return filterLeadToBuy(leadObj)
};

//funkcja do filtrowania danych o kontaktach do danych potrzebnych tylko odo kupienia 
function filterLeadToBuy(leads:Lead[]){
  let leadToBuy = [];
  leads.forEach(lead => {
    const onelead = {
      lead_id: lead.lead_id,
      name: lead.name,
      type: lead.type,
      campaign: lead.campaign,
      price: lead.price,
      area: lead.area,
    };
  leadToBuy.push(onelead)
  })
return leadToBuy
};

//---POBIERANIE DANYCH O KONTAKTACH WŁASNYCH, JUŻ ZAKUPIONYCH, ORAZ AKCJA ZAKUPU------------

//kontakty zakupione (z przypisanym właścicielem) z danego regionu
export async function getLeadsOwnByRegion(region: string): Promise<Lead[]>{
  let leadObj = await LeadMdb.find({region: region});
  return leadObj;
};

//kontakty zakupione (z przypisanym właścicilem) wszystkie
export async function getLeadsOwnAll(): Promise<Lead[]>{
  let leadObj = await LeadMdb.find({});
  return leadObj;
};

//kontakty zakupione (z przypisanym właścicilem) z danego obszaru
export async function getLeadsOwnByArea(area: string): Promise<Lead[]>{
  let leadObj = await LeadMdb.find({area: area});
  return leadObj;
};

// kontakty zakupione (z przypisanym właścicelem) do danego użyktownika
export async function getLeadsOwnByUser(user: string): Promise<Lead[]>{
  let leadObj = await LeadMdb.find({owner: user});
  return leadObj;
};

// kontakty zakupione (z przypisanym właścicilem) do danego identyfikatora 
export async function getLeadsOwnById(lead_id: number): Promise<Lead[]>{
  let leadObj = await LeadMdb.find({lead_id: lead_id});
  return leadObj;
};

//funkcja przypisująca właściciela do danego leada po kupieniu go i dodanie akcji kupna
export async function updateBuyLead(agent: string, lead_id: number){
  let lead = await LeadMdb.find({lead_id: lead_id});

  const newAction = new ActionMdb ({
    lead_id: lead[0].lead_id,
    owner: agent,
    area: lead[0].area,
    region: lead[0].region,
    date: getCurrentDate(),
    status: 'Kupiony',
    note: "",
    policy: "",
    income: 0,
  });
  newAction.save();

  await LeadMdb.updateOne({lead_id: lead_id}, {
    owner: agent,
    status: "Kupiony"
  });
};

//poiberanie daty i ustawianie w dobrym formacie 
function getCurrentDate(){
  const dateNow = new Date();
  const year = dateNow.getFullYear();
  let month = dateNow.getMonth()+1;
  let day = dateNow.getDate();
  let hour = dateNow.getHours()+1;
  let minute = dateNow.getMinutes()+1;
  let monthString: string;
  let dayString: string;
  let hourString: string;
  let minuteString: string;

  if(month <10){
    monthString = '0' +  month;
  }else{
    monthString = month.toString();
  }

  if(day <10){
    dayString = '0' + day;
  }else{
    dayString = day.toString();
  }
  if(hour <10){
    hourString = '0' + hour;
  }else{
    hourString = hour.toString();
  }
  if(minute <10){
    minuteString = '0' + minute;
  }else{
    minuteString = minute.toString();
  }
  const dateFormat = year + '-' + monthString + '-' + dayString + " " + hourString + ':' + minuteString;

return dateFormat
};


//--------------DODAWANIE WŁASNEGO KONTAKTU Z FORMULARZA-----------------

export async function addLeadOwn(lead: Lead ) {
  let leadAll= await LeadMdb.find({});
  const lead_id = leadAll.length +  1 + Math.floor(Math.random()*1000);

    //dodanie nowego kontaktu
    const newLead = new LeadMdb ({
      lead_id: lead_id,
      name: lead.name,
      surname: lead.surname,
      phone: lead.phone,
      mail: lead.mail,
      town: lead.town,
      post_code: lead.post_code,
      adress: lead.adress,
      client_type: lead.client_type,
      age: lead.age,
      type: lead.type,
      campaign: lead.campaign,
      product: lead.product,
      campaign_image:lead.campaign_image,
      price:lead.price,
      region:lead.region,
      area:lead.area,
      owner:lead.owner,
      status:lead.status,
    });
    newLead.save();

    const newAction = new ActionMdb ({
      lead_id: lead_id,
      owner: lead.owner,
      area: lead.area,
      region: lead.region,
      date: getCurrentDate(),
      status: lead.status,
      note: "",
      policy: "",
      income: 0,
    });
    newAction.save();
  
  return true
};

//dodawanie leadów z plików txt
export async function addLeadFromCsv(leadFile: {data: string} ) {
  let leadArr = leadFile.data.split("\n");
  if(leadArr.length > 0){
      leadArr.forEach(async (el) => {
        let oneLeadArr = el.split(','); 
        if(oneLeadArr.length > 1){
          let id = 3000+Math.floor(Math.random()*(1000))+Math.floor(Math.random()*(1000))+Math.floor(Math.random() * (1000));
          if(oneLeadArr[15] !== undefined){
            const slashInArea =  oneLeadArr[15].length;

            const newLead = new LeadMdb ({
              lead_id: id,
              name: oneLeadArr[0],
              surname: oneLeadArr[1],
              phone:oneLeadArr[2],
              mail: oneLeadArr[3],
              town: oneLeadArr[4],
              post_code: oneLeadArr[5],
              adress: oneLeadArr[6],
              client_type:oneLeadArr[7],
              age:oneLeadArr[8],
              type:oneLeadArr[9],
              campaign:oneLeadArr[10],
              product:oneLeadArr[11],
              campaign_image: oneLeadArr[12],
              price: parseInt(oneLeadArr[13]),
              region:oneLeadArr[14],
              area:oneLeadArr[15].substring(0, slashInArea-2),
              owner: "",
              status: "Wgrany"
            }); 
            newLead.save();
            
          }else
          {return false}; 
        }else{return false};
      });
      return true
    }else
    {return false};
};

//funkcja do usuwania leadów
export async function deleteLead(lead:{lead_id:number}) {
  await LeadMdb.deleteOne({lead_id: lead.lead_id});
  await ActionMdb.deleteMany({lead_id: lead.lead_id});
return true
};

//------------POBIERANIE DANYCH DOTYCZĄCYCH STATUSÓW KONTKATÓW-----------

//pobranie statusów po lead id
export async function getStatusById(lead_id: number): Promise<Action[]>{
   let actionObj = await ActionMdb.find({lead_id: lead_id});
  return actionObj;
};

//pobranie statusów po lead nick
export async function getStatusByUser(owner: string): Promise<Action[]>{
  let actionObj = await ActionMdb.find({owner: owner});
  return actionObj;
};

//pobranie statusów po obszarze
export async function getStatusByArea(area: string): Promise<Action[]>{
  let actionObj = await ActionMdb.find({area: area});
  return actionObj;
};

//pobranie statusów po regionie
export async function getStatusByRegion(region: string): Promise<Action[]>{
  let actionObj: Action[];
  if( region === "Wszystkie"){
    actionObj = await ActionMdb.find({});
    return actionObj;
  }else{
    actionObj = await ActionMdb.find({region: region});
    return actionObj;
  }
};

//dodanie statusu i update statusu kontaktu 
export async function addStatus(statusData: any){
  const successStatus = await ActionMdb.find({lead_id: statusData.lead_id, status: "Sukces"});
  if (successStatus[0] !== undefined){
    return false
  }else{
    await LeadMdb.updateOne({lead_id: statusData.lead_id}, {status: statusData.status});
    const lead = await LeadMdb.find({lead_id:statusData.lead_id}); 

    let policyData: string = '';
    let incomeData = 0;
    if(statusData.success.length > 0 ){
      policyData = statusData.success[0].policy;
      incomeData = parseInt(statusData.success[0].income);
    };

    const newAction = new ActionMdb ({
      lead_id: lead[0].lead_id,
      owner: lead[0].owner,
      area: lead[0].area,
      region: lead[0].region,
      date: getCurrentDate(),
      status: statusData.status,
      note: statusData.note,
      policy: policyData,
      income: incomeData,
    });
    newAction.save();
    return true
  };
};

//---------------------DANE DO WYKONANIA WYKRESÓW-------------------------------

//dane o kontaktach do wykresów 
export async function leadToCharts(data:{user?:string, area?:string, region?:string}) {
  let dataTypeLabel  = [];
  let dataTypeValue = [];
  let dataOneLabel = [];
  let dataOneValue = [];
  let dataTwoLabel = [];
  let dataTwoValue = [];
  let tabData =[];
  let tabOne = [];
  let tabTwo = [];

  if(data.user){
    let leadObj =  await LeadMdb.find({owner: data.user});
    let leadObjOne =  await LeadMdb.find({owner: data.user, type: "Życie"});
    let leadObjTwo =  await LeadMdb.find({owner: data.user, type: "Majątek"});

     //podział na majątek i życie
    leadObj.forEach(el => {
      tabData.push(el.type)
    });

    let countData = {};
      tabData.forEach(function(i) { countData[i] = (countData[i]||0) + 1;});
      for (const [key, value] of Object.entries(countData)) {
        dataTypeLabel.push(key);
        dataTypeValue.push(value);
      };

    //podział na kampanie Życiowe
    leadObjOne.forEach(el => {
      tabOne.push(el.campaign)
    });
    let countDataLive = {};
    tabOne.forEach(function(i) { countDataLive[i] = (countDataLive[i]||0) + 1;});
    for (const [key, value] of Object.entries(countDataLive)) {
      dataOneLabel.push(key);
      dataOneValue.push(value);
    };

    //podziea na kampanie Majątkowe
    leadObjTwo.forEach(el => {
      tabTwo.push(el.campaign)
    });
    let countDataAssets = {};
    tabTwo.forEach(function(i) { countDataAssets[i] = (countDataAssets[i]||0) + 1;});
    for (const [key, value] of Object.entries(countDataAssets)) {
      dataTwoLabel.push(key);
      dataTwoValue.push(value);
    };
  };
  
  if(data.area){
    let leadObj =  await LeadMdb.find({area: data.area});
    let leadObjOne =  await LeadMdb.find({area: data.area, owner: ""});
    let leadObjTwo =  await LeadMdb.find({area: data.area, owner: {$ne: ""}});

    //podział na kupione i nie 
    leadObj.forEach(el => {
      if(el.owner ===""){
        tabData.push("Nie zakupione")
      }else if(el.owner !==""){
        tabData.push("Zakupione")
      }
    });
    let countData = {};
    tabData.forEach(function(i) { countData[i] = (countData[i]||0) + 1;});
          for (const [key, value] of Object.entries(countData)) {
            dataTypeLabel.push(key);
            dataTypeValue.push(value);
          };

      //podział na kampanie które mają właściciela
      leadObjOne.forEach(el => {
        tabOne.push(el.campaign)
      });
      let countDataLive = {};
      tabOne.forEach(function(i) { countDataLive[i] = (countDataLive[i]||0) + 1;});
      for (const [key, value] of Object.entries(countDataLive)) {
        dataOneLabel.push(key);
        dataOneValue.push(value);
      };
  
      //podziea na kampanie które nie mają właściciela
      leadObjTwo.forEach(el => {
        tabTwo.push(el.campaign)
      });
      let countDataAssets = {};
      tabTwo.forEach(function(i) { countDataAssets[i] = (countDataAssets[i]||0) + 1;});
      for (const [key, value] of Object.entries(countDataAssets)) {
        dataTwoLabel.push(key);
        dataTwoValue.push(value);
      };
    };

    if(data.region){
      let leadObj = [];
      let leadObjOne = [];
      let leadObjTwo = [];

      if(data.region === "Wszystkie"){
        leadObj =  await LeadMdb.find({});
        leadObjOne =  await LeadMdb.find({owner: ""});
        leadObjTwo =  await LeadMdb.find({owner: {$ne: ""}});
    
      }else{
        leadObj =  await LeadMdb.find({region: data.region});
        leadObjOne =  await LeadMdb.find({region: data.region, owner: ""});
        leadObjTwo =  await LeadMdb.find({region: data.region, owner: {$ne: ""}});
    
      }

      //podział na kupione i nie 
      leadObj.forEach(el => {
        if(el.owner ===""){
          tabData.push("Nie zakupione")
        }else if(el.owner !==""){
          tabData.push("Zakupione")
        }
      });
      let countData = {};
      tabData.forEach(function(i) { countData[i] = (countData[i]||0) + 1;});
            for (const [key, value] of Object.entries(countData)) {
              dataTypeLabel.push(key);
              dataTypeValue.push(value);
            };
  
        //podział na kampanie które mają właściciela
        leadObjOne.forEach(el => {
          tabOne.push(el.campaign)
        });
        let countDataLive = {};
        tabOne.forEach(function(i) { countDataLive[i] = (countDataLive[i]||0) + 1;});
        for (const [key, value] of Object.entries(countDataLive)) {
          dataOneLabel.push(key);
          dataOneValue.push(value);
        };
    
        //podziea na kampanie które nie mają właściciela
        leadObjTwo.forEach(el => {
          tabTwo.push(el.campaign)
        });
        let countDataAssets = {};
        tabTwo.forEach(function(i) { countDataAssets[i] = (countDataAssets[i]||0) + 1;});
        for (const [key, value] of Object.entries(countDataAssets)) {
          dataTwoLabel.push(key);
          dataTwoValue.push(value);
        };
      };
    
  //objekt zawierający dane do wykresów 
  let chartsData = {
    dataTypeLabel: dataTypeLabel,
    dataTypeValue: dataTypeValue,
    dataOneLabel: dataOneLabel,
    dataOneValue: dataOneValue,
    dataTwoLabel: dataTwoLabel,
    dataTwoValue: dataTwoValue
  };

return chartsData
};

// dane o statusach do wykresu 
export async function statusToCharts(data:{user?:string, area?:string, region?: string}) {

  let statusLabel  = [];
  let statusValue = [];
  let tabData =[];
  let leadObj;

if(data.user){
  leadObj =  await LeadMdb.find({owner: data.user});
    //podział na statusy
    leadObj.forEach(el => {
      tabData.push(el.status)
    });
    let countData = {};
    tabData.forEach(function(i) { countData[i] = (countData[i]||0) + 1;});
    for (const [key, value] of Object.entries(countData)) {
      statusLabel.push(key);
      statusValue.push(value);
    };
};

if(data.area){
  leadObj =  await LeadMdb.find({area: data.area, status: "Sukces"});
    //podział na statusy
    leadObj.forEach(el => {
      tabData.push(el.owner)
    });
    let countData = {};
    tabData.forEach(function(i) { countData[i] = (countData[i]||0) + 1;});
    for (const [key, value] of Object.entries(countData)) {
      statusLabel.push(key);
      statusValue.push(value);
    };
};

if(data.region){
  if(data.region === "Wszystkie"){
    leadObj =  await LeadMdb.find({status: "Sukces"});
        //podział na statusy
        leadObj.forEach(el => {
          tabData.push(el.region)
        });
  }else{
    leadObj =  await LeadMdb.find({region: data.region, status: "Sukces"});
        //podział na statusy
        leadObj.forEach(el => {
          tabData.push(el.area)
        });
  }

    let countData = {};
    tabData.forEach(function(i) { countData[i] = (countData[i]||0) + 1;});
    for (const [key, value] of Object.entries(countData)) {
      statusLabel.push(key);
      statusValue.push(value);
    };
};

  let chartsData = {
    statusLabel: statusLabel,
    statusValue: statusValue,
  }
  return chartsData
};

//--------------------POBRANIE DANYCH O KAMPANIACH----------------------

export async function getCampaign(): Promise<Campaign[]>{
  const campaingList = await CampaignMdb.find({});
  return campaingList;
};

//-------------------POBRANIE DANYCH DO PORTFELA------------------------

//wyliczenie o przychodach i  prowizji dla agenta
export async function leadCommision(user:string) {
  let commisionTab = [];
  let leadObj =  await LeadMdb.find({owner: user, status: "Sukces"});
  let statusObj =  await ActionMdb.find({owner: user, status: "Sukces"});
  let campaignObj =  await CampaignMdb.find({});
  if(leadObj.length > 0){
    leadObj.forEach(lead => {
      let status = statusObj.find(status => status.lead_id == lead.lead_id );
      let campaign = campaignObj.find(campaign => campaign.campaign === lead.campaign);
      let commision: Commision = {
        lead_id: lead.lead_id,
        type: lead.type,
        campaign: lead.campaign,
        income: status.income,
        commision: Math.ceil(status.income*campaign.commision),
        policy:status.policy,
        date: status.date.substr(0,10),
        month: status.date.substr(0,7)
      }
      commisionTab.push(commision)
    });
    return commisionTab
  }else 
    return []
};

//pobranie danych o wydatach agenta na kontakty
export async function ownLeadWallet(user:string) {
  let ownLeadTab = [];
  let leadObj =  await LeadMdb.find({owner: user});
  let statusObj =  await ActionMdb.find({owner: user, status:{$in:["Własny", "Kupiony"]} });

  if(leadObj.length > 0){
  leadObj.forEach(lead => {
    let status = statusObj.find(status => status.lead_id === lead.lead_id );
    let ownLead = {
      lead_id: lead.lead_id,
      type: lead.type,
      campaign: lead.campaign,
      price: lead.price,
      date: status.date.substr(0,10),
      month: status.date.substr(0,7)
    }
    ownLeadTab.push(ownLead)
  });
  return ownLeadTab
  } else return []
};

//pobranie dat, w jakich następowały akcję 
export async function getBilansSummaryData(data:{area?:string, region?:string}){  

  let dataToSelect = [];
  let statusObj: Action[];

  if (data.area){
    statusObj =  await ActionMdb.find({area: data.area});
  };
  if (data.region){
    if (data.region === "Wszystkie"){
      statusObj =  await ActionMdb.find({});
    }else{
      statusObj =  await ActionMdb.find({region: data.region});
    };
  };
  statusObj.forEach(el => {
    dataToSelect.push(el.date.substr(0,7))
  });
  const tabSet = [...new Set(dataToSelect)].sort();
  let dataToSelectSend = ['Wszystkie', ...tabSet];
  return(dataToSelectSend)
};

//pobranie danych do bilansu 
export async function getBilansSummaryArea(data:{area:string, period:string}) {
  let returnTab: Bilans[] = [];
  let userArea =  await UserMdb.find({area: data.area, active: true, role: "agent"});

  for await (const agent of userArea ){
    //dane do obiektu 
    let agent_b = agent.name +" " + agent.surname + " ("+agent.nick+")";
    let count_lead_b = 0;
    let count_success_b = 0;
    let effectiveness_b = 0;
    let expense_b = 0;
    let income_b = 0;
    let bilans_b = 0;
          
    let leadObj: any; 
    let statusObj: any;
    let leadIdStatusSuccess: any
    const periodToSearch = new RegExp(`^${data.period}`, "i");
    if(data.period !== "Wszystkie"){
      let statusBuyObj =  await ActionMdb.find({owner: agent.nick, status:{$in:["Własny", "Kupiony"]}, date:{$regex: periodToSearch}});
      leadIdStatusSuccess = [];
      leadObj = [];
      for await (const success of statusBuyObj ){
        leadIdStatusSuccess.push(success.lead_id)  
      };
    };
  
    if(data.period === "Wszystkie"){
      //wszystkie leady i sukcesy użykownika
      leadObj =  await LeadMdb.find({owner: agent.nick});
      statusObj =  await ActionMdb.find({owner: agent.nick, status: "Sukces"})
    }else{
      //wszystkie leady i sukcesy użykownika
      leadObj =  await LeadMdb.find({lead_id:{$in: leadIdStatusSuccess}});
      statusObj =  await ActionMdb.find({owner: agent.nick, status:"Sukces", date:{$regex: periodToSearch}});
    };
  
    if(leadObj.length > 0 ){
      //liczba leadów
      count_lead_b = leadObj.length;
      //liczba sukcesów
      count_success_b = statusObj.length;
      //efektywność 
      if( count_lead_b === 0 && count_success_b === 0){effectiveness_b = 0}
      else if(count_success_b === 0){effectiveness_b = 0}
      else{effectiveness_b = Math.round((count_success_b/count_lead_b)*100)};
      //suma wydatków
      for await(const el of leadObj ){
        expense_b += el.price 
      };
    };
  
    if(statusObj.length > 0){
      //sukcesy użtkownika        
      for await (const el of statusObj ){
        income_b += el.income
      };
    };
          
    //bilans
    bilans_b= income_b - expense_b;
       
    let userBilans: Bilans = {
      agent:agent_b,
      count_lead: count_lead_b,
      count_success:  count_success_b,
      effectiveness: effectiveness_b,
      expense: expense_b,
      income: income_b,
      bilans: bilans_b,
    };

    returnTab.push(userBilans);

  };
  return returnTab   
};

export async function getBilansSummaryRegion(data:{region:string, period:string}) {
  let returnTab: Bilans[] = [];
  let areas: string[];
  const northRegionAreas = ["Zachodnio-Pomorskie", "Pomorskie", "Warmińsko-Mazurskie", "Kujawsko-Pomorskie", "Podlaskie", "Lubuskie", "Wielkopolskie", "Mazowieckie" ];
  const southRegionAreas = ["Dolnośląskie", "Lubelskie", "Małopolskie", "Opolskie", "Podkarpackie", "Łódzkie", "Śląskie", "Świętokrzyskie"];
      
  if(data.region === "Północ"){
    areas = northRegionAreas
  };

  if(data.region === "Południe"){
    areas = southRegionAreas
  };

  if(data.region === "Wszystkie"){
    areas = northRegionAreas.concat(southRegionAreas)
  };

  const periodToSearch = new RegExp(`^${data.period}`, "i");

  for await (const area of areas ){

    //dane do obiektu 
    let agent_b = area;
    let count_lead_b = 0;
    let count_success_b = 0;
    let effectiveness_b = 0;
    let expense_b = 0;
    let income_b = 0;
    let bilans_b = 0;
          
    let leadObj: any; 
    let statusObj: any;     
    let leadIdStatusSuccess: any

    if(data.period !== "Wszystkie"){
      let statusBuyObj =  await ActionMdb.find({area: area, status:{$in:["Własny", "Kupiony"]}, date:{$regex: periodToSearch}});
      leadIdStatusSuccess = [];
      leadObj = [];
      for await (const success of statusBuyObj ){
        leadIdStatusSuccess.push(success.lead_id)  
      };
    };
  
    if(data.period === "Wszystkie"){
      //wszystkie leady i sukcesy obszaru
      leadObj =  await LeadMdb.find({area: area});
      statusObj =  await ActionMdb.find({area: area, status: "Sukces"});
    }else{
      //wszystkie leady i sukcesy obszaru
      leadObj =  await LeadMdb.find({lead_id:{$in: leadIdStatusSuccess}});
      statusObj =  await ActionMdb.find({area: area, status:"Sukces", date:{$regex: periodToSearch}});
    };
  
    if(leadObj.length > 0){
      //liczba leadów
      count_lead_b = leadObj.length;
      //liczba sukcesów
      count_success_b = statusObj.length;
      //efektywność 
      if( count_lead_b === 0 && count_success_b === 0){effectiveness_b = 0}
      else if(count_success_b === 0){effectiveness_b = 0}
      else{effectiveness_b = Math.round((count_success_b/count_lead_b)*100)};
      //suma wydatków
      for await(const el of leadObj ){
        expense_b += el.price 
      };
    };
  
    if(statusObj.length > 0){
      //sukcesy użtkownika        
      for await (const el of statusObj ){
        income_b += el.income
      };
    };

    //bilans
    bilans_b= income_b - expense_b;
    let userBilans: Bilans = {
      agent:agent_b,
      count_lead: count_lead_b,
      count_success:  count_success_b,
      effectiveness: effectiveness_b,
      expense: expense_b,
      income: income_b,
      bilans: bilans_b,
    };

    returnTab.push(userBilans) 
  };

  return  returnTab

};