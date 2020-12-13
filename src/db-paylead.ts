import * as fs from 'fs';
import * as util from 'util';
import { User } from './models/User';
import { LoginData } from './models/LoginData';
import { LoginRes } from './models/LoginRes'
import { Lead } from './models/Lead'
import { Action } from './models/Action';
import { ChangePassword } from './models/ChangePassword';
import { Campaign } from './models/Campaign';
import { Commision } from './models/Commision';

type USER = User[];
type LEAD = Lead[];
type ACTION = Action [];
type CAMPAIGN = Campaign [];


const readFile = util.promisify(fs.readFile);

const user$: Promise<USER> = readFile('./data/users.json', 'utf8')
  .then(JSON.parse, console.error);

const leads$: Promise<LEAD> = readFile('./data/leads.json', 'utf8')
  .then(JSON.parse, console.error)

const leadsActions$: Promise<ACTION> = readFile('./data/leads_actions.json', 'utf8')
  .then(JSON.parse, console.error)

const campaigns$: Promise<CAMPAIGN> = readFile('./data/campaign.json', 'utf8')
  .then(JSON.parse, console.error)




//logowanie użytkownika
export async function getUserToLogin(loginData: LoginData): Promise<LoginRes> {
  const user = (await user$).find(user => user.nick === loginData.nick);
  if(user !== undefined){

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
      active:user.active
    };

    if(user.password === loginData.password)
      return ({loginError:false, loginUser: userToSend})
    else
      return ( {loginError:true})
  }
  else
    return ( {loginError:true})
  }

//zmiana hasła użytkownika
export async function changePassword(changePassword: ChangePassword ): Promise<boolean> {

  const user = (await user$).find(user => user.nick === changePassword.nick);

  if(user.password === changePassword.password){
    (await user$).find(user => user.nick === changePassword.nick).password = changePassword.newPassword
    return true
    }
  else
    return false
  }



  //pobranie użytkowników danego regionu 
  export async function getUsersByArea(structure:{area?: string, region?:string}){
    let userObj: User[];
    if(structure.area){
      userObj = (await user$).filter(p => p.area === structure.area);
    } else if(structure.region){
      userObj = (await user$).filter(p => p.area === structure.region);
    }
    return filterUsers(userObj)
  }

//pobieranie leadów do kupienia 

//leady to kupienia wszystkie 
export async function getLeadsToBuy(): Promise<Lead[]>{
  let leadObj = (await leads$).filter(p => p.owner === "")
  return filterLeadToBuy(leadObj)
}

//leady to kupienia z podanego Region
export async function getLeadsToBuyByRegion(region: string): Promise<Lead[]>{
  let leadObj = (await leads$).filter(p => p.owner === "" && p.region === region);
  return filterLeadToBuy(leadObj)
}

//leady to kupienia z podanego Area
export async function getLeadsToBuyByArea(area: string): Promise<Lead[]>{
  let leadObj = (await leads$).filter(p => p.owner === "" && p.area === area);
  return filterLeadToBuy(leadObj)
}




//pobieranie leadów z portfela

//leady to kupienia wszystkie 
export async function getLeadsOwn(): Promise<Lead[]>{
  return (await leads$);
}

//leady to kupienia z podanego Region
export async function getLeadsOwnByRegion(region: string): Promise<Lead[]>{
  return (await leads$).filter(p => p.owner !== "" && p.region === region);
}

//leady to kupienia z podanego Area
export async function getLeadsOwnByArea(area: string): Promise<Lead[]>{
  return (await leads$).filter(p => p.owner !== "" && p.area === area);
}

export async function getLeadsOwnByUser(user: string): Promise<Lead[]>{
  return (await leads$).filter(p => p.owner === user);
}

export async function getLeadsOwnById(lead_id: number): Promise<Lead[]>{
  return (await leads$).filter(p => p.lead_id === lead_id);
}

// dodawanie własnego leada
export async function addLeadOwn(lead: Lead ) {
  let newLead = lead;
  const lead_id = (await leads$).length + 1;
  newLead.lead_id = lead_id;

  const action: Action = {
    lead_id: lead_id,
    owner: lead.owner,
    area: lead.area,
    region: lead.region,
    date: new Date().toLocaleString(),
    status: lead.status,
    note: '',
    policy: '',
    income: 0
  };

  (await leads$).push(newLead);
  (await leadsActions$).push(action);

  return true
}

//pobranie statusów po lead id
export async function getStatusById(lead_id: number): Promise<Action[]>{
  return (await leadsActions$).filter(p => p.lead_id === lead_id);
}

//pobranie statusów po lead nick
export async function getStatusByUser(owner: string): Promise<Action[]>{
  return (await leadsActions$).filter(p => p.owner === owner);
}


//dodanie statusu i update statusu kontaktu 
export async function addStatus(statusData: any){
  (await leads$).find(lead => lead.lead_id === statusData.lead_id).status = statusData.status;
  const lead = (await leads$).find(lead => lead.lead_id === statusData.lead_id);
  let policyData: string = '';
  let incomeData: number = 0;

  if(statusData.success.length > 0 ){
    policyData = statusData.success[0].policy;
    incomeData = parseInt(statusData.success[0].income);
  }

  const action: Action = {
    lead_id: lead.lead_id,
    owner: lead.owner,
    area: lead.area,
    region: lead.region,
    status: statusData.status,
    date: new Date().toLocaleString(),
    note: statusData.note,
    policy: policyData,
    income: incomeData,
  
  };
  (await leadsActions$).push(action);
  return true
}

//pobranie statusów po wszystkich
export async function getStatusAll(): Promise<Action[]>{
  return (await leadsActions$);
}

//funkcja przypisująca właściciela do danego leada po kupieniu go i dodanie akcji kupna
export async function updateBuyLead(agent: string, lead_id: number){

  const lead = (await leads$).find(lead => lead.lead_id === lead_id);

  const action: Action = {
    lead_id: lead.lead_id,
    owner: agent,
    area: lead.area,
    region: lead.region,
    date: new Date().toLocaleString(),
    status: lead.status,
    note: '',
    policy: '',
    income: 0
  };

  (await leadsActions$).push(action);
  (await leads$).find(lead => lead.lead_id === lead_id).owner=agent;
}


//funkcja do filtrowania danych o leadach do danych potrzebnych tylk odo kupienia 
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
}



//funkcja do filtrowania danych o leadach do danych potrzebnych tylk odo kupienia 
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
}




//------------------------------------------------------------------------------
//do wykresów

export async function leadToCharts(user:string) {

  let dataTypeLabel  = [];
  let dataTypeValue = [];
  let dataAssetsLabel = [];
  let dataAssetsValue = [];
  let dataLiveLabel = [];
  let dataLiveValue = [];
  let tabData =[];
  let tabLive = [];
  let tabAssets = [];
  let leadObj = (await leads$).filter(p => p.owner === user);
  let leadObjLive = (await leads$).filter(p => p.owner === user && p.type==="Życie");
  let leadObjAssets = (await leads$).filter(p => p.owner === user && p.type==="Majątek");

  //podział na majątek i życie
  leadObj.forEach(el => {
    tabData.push(el.type)
  });
  let countData = {};
  tabData.forEach(function(i) { countData[i] = (countData[i]||0) + 1;});
  for (const [key, value] of Object.entries(countData)) {
    dataTypeLabel.push(key);
    dataTypeValue.push(value);
  }

   //podział na kampanie Życiowe
  leadObjLive.forEach(el => {
    tabLive.push(el.campaign)
  });
  let countDataLive = {};
  tabLive.forEach(function(i) { countDataLive[i] = (countDataLive[i]||0) + 1;});
  for (const [key, value] of Object.entries(countDataLive)) {
    dataLiveLabel.push(key);
    dataLiveValue.push(value);
  }

  //podzieł na kampanie Majątkowe
  leadObjAssets.forEach(el => {
    tabAssets.push(el.campaign)
  });
  let countDataAssets = {};
  tabAssets.forEach(function(i) { countDataAssets[i] = (countDataAssets[i]||0) + 1;});
  for (const [key, value] of Object.entries(countDataAssets)) {
    dataAssetsLabel.push(key);
    dataAssetsValue.push(value);
  }

 let chartsData = {
  dataTypeLabel: dataTypeLabel,
  dataTypeValue: dataTypeValue,
  dataAssetsLabel: dataAssetsLabel,
  dataAssetsValue: dataAssetsValue,
  dataLiveLabel: dataLiveLabel,
  dataLiveValue: dataLiveValue
}
return chartsData
}


export async function statusToCharts(user:string) {

  let statusLabel  = [];
  let statusValue = [];
  let tabData =[];
  let leadObj = (await leads$).filter(p => p.owner === user);

  //podział na majątek i życie
  leadObj.forEach(el => {
    tabData.push(el.status)
  });
  let countData = {};
  tabData.forEach(function(i) { countData[i] = (countData[i]||0) + 1;});
  for (const [key, value] of Object.entries(countData)) {
    statusLabel.push(key);
    statusValue.push(value);
  }
  let chartsData = {
    statusLabel: statusLabel,
    statusValue: statusValue,
  }
  return chartsData

}

//pobranie statusów po lead id
export async function getCampaign(): Promise<Campaign[]>{
  return (await campaigns$);
}


export async function leadCommision(user:string) {

  let commisionTab = [];

  let leadObj = (await leads$).filter(p => p.status === "Sukces" && p.owner === user);
  let statusObj = (await leadsActions$).filter(p => p.status === "Sukces" && p.owner === user);
  let campaignObj = (await campaigns$);

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
} else return []
}

export async function ownLeadWallet(user:string) {
  let ownLeadTab = [];
  let leadObj = (await leads$).filter(p => p.owner === user);
  let statusObj = (await leadsActions$).filter(p => p.status === "Kupiony" && p.owner === user);

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
}