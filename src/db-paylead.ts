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
import { NewUser } from './models/newUser';
import { Bilans } from './models/Bilans';

//ustawienia typów pobieranych danych
type USER = User[];
type LEAD = Lead[];
type ACTION = Action [];
type CAMPAIGN = Campaign [];

//ustawienie zmiennych do pobierania poszczególnych danych z bazy 
const readFile = util.promisify(fs.readFile);

const user$: Promise<USER> = readFile('./data/users.json', 'utf8')
  .then(JSON.parse, console.error);

const leads$: Promise<LEAD> = readFile('./data/leads.json', 'utf8')
  .then(JSON.parse, console.error)

const leadsActions$: Promise<ACTION> = readFile('./data/leads_actions.json', 'utf8')
  .then(JSON.parse, console.error)

const campaigns$: Promise<CAMPAIGN> = readFile('./data/campaign.json', 'utf8')
  .then(JSON.parse, console.error)


//----------------POBIERANIE DANYCH DOTYCZACYCH AGENTA--------------------

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
    if(user.password === loginData.password && user.active)
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

  //pobranie użytkowników danego obszaru 
  export async function getUsersByArea(structure:{area?: string}){
    let userObj: User[];
    //pobranie użytkowników danego obszaru 
      userObj = (await user$).filter(p => p.area === structure.area);
    //pobranie użytkowników danego obszaru
    return filterUsers(userObj)
  }



  export async function getUsersByRegion(structure:{region?:string}){

    let regionUsers = (await user$).filter(p => p.region === structure.region);

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
    return (await user$).find(user => user.region === structure.region && user.role === "region");
  }



  //dodawanie nowego agenta
  export async function addNewAgent(newAgent: NewUser){

    const agent_id = (await user$).length;
    const nickCheck = newAgent.name.toLowerCase().substr(0,3) + newAgent.surname.toLowerCase();
    let nick = '';
    const userExist = (await user$).find(p => p.nick === nickCheck);

    if(userExist === undefined){
      nick = nickCheck
    }else{
      nick = nickCheck+agent_id
    }

    const newUser: User = {
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
    };
    (await user$).push(newUser);
    return true
  }

  //dodawanie nowego agenta
  export async function changeDataUser(changeAgent: NewUser){
    
    if(true){
      (await user$).find(p => p.nick === changeAgent.nick).name = changeAgent.name;
      (await user$).find(p => p.nick === changeAgent.nick).surname = changeAgent.surname;
      (await user$).find(p => p.nick === changeAgent.nick).phone = changeAgent.phone;
      (await user$).find(p => p.nick === changeAgent.nick).mail = changeAgent.mail;
    }
    return true
  };

  //dezaktywacja agenta i przepięcie portela na innego agenta

  export async function deactivateAgent(deactivatedData:{dectivatedAgent:string, agentToWalletChange: string }){
    (await user$).find(p => p.nick === deactivatedData.dectivatedAgent).active = false;
    
    let agentLeads =  (await leads$).filter(p => p.owner === deactivatedData.dectivatedAgent);
    agentLeads.forEach(async el => {
      (await leads$).find(p => p.owner === el.owner).owner= deactivatedData.agentToWalletChange;
    });

    let agentStatuses =  (await leadsActions$).filter(p => p.owner === deactivatedData.dectivatedAgent);
    agentStatuses.forEach(async el => {
      (await leadsActions$).find(p => p.owner === el.owner && p.date === el.date).owner= deactivatedData.agentToWalletChange;
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
  }
  
//-----------------POBIERANIE DANYCH O KONTAKTACH DO KUPIENIA ------------------

//kontakty to kupienia wszystkie 
export async function getLeadsToBuy(): Promise<Lead[]>{
  let leadObj = (await leads$).filter(p => p.owner === "")
  return filterLeadToBuy(leadObj)
}

//kontakty to kupienia z podanego Region
export async function getLeadsToBuyByRegion(region: string): Promise<Lead[]>{
  let leadObj = (await leads$).filter(p => p.owner === "" && p.region === region);
  return filterLeadToBuy(leadObj)
}

//kontakty to kupienia z podanego Area
export async function getLeadsToBuyByArea(area: string): Promise<Lead[]>{
  let leadObj = (await leads$).filter(p => p.owner === "" && p.area === area);
  return filterLeadToBuy(leadObj)
}

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
}

//---POBIERANIE DANYCH O KONTAKTACH WŁASNYCH, JUŻ ZAKUPIONYCH, ORAZ AKCJA ZAKUPU------------

//kontakty zakupione (z przypisanym właścicielem) z danego regionu
export async function getLeadsOwnByRegion(region: string): Promise<Lead[]>{
  return (await leads$).filter(p => p.owner !== "" && p.region === region);
}

//kontakty zakupione (z przypisanym właścicilem) z danego obszaru
export async function getLeadsOwnByArea(area: string): Promise<Lead[]>{

  return (await leads$).filter(p => p.area === area);
}

// kontakty zakupione (z przypisanym właścicelem) do danego użyktownika
export async function getLeadsOwnByUser(user: string): Promise<Lead[]>{
  return (await leads$).filter(p => p.owner === user);
}

// kontakty zakupione (z przypisanym właścicilem) do danego identyfikatora 
export async function getLeadsOwnById(lead_id: number): Promise<Lead[]>{
  return (await leads$).filter(p => p.lead_id === lead_id);
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
    status: "Kupiony",
    note: '',
    policy: '',
    income: 0
  };

  (await leadsActions$).push(action);
  (await leads$).find(lead => lead.lead_id === lead_id).owner=agent;
}


//--------------DODAWANIE WŁASNEGO KONTAKTU Z FORMULARZA-----------------

export async function addLeadOwn(lead: Lead ) {
  let newLead = lead;
  const lead_id = (await leads$).length + 1;
  newLead.lead_id = lead_id;
  //stworznie nowej akcji w czasie dodania własnego kontaktu
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
  //dodanie nowego kontaktu
  (await leads$).push(newLead);
  //dodanie akcji o dodaniu własnego kontaktu
  (await leadsActions$).push(action);
  return true
}


//------------POBIERANIE DANYCH DOTYCZĄCYCH STATUSÓW KONTKATÓW-----------

//pobranie statusów po lead id
export async function getStatusById(lead_id: number): Promise<Action[]>{
  return (await leadsActions$).filter(p => p.lead_id === lead_id);
}

//pobranie statusów po lead nick
export async function getStatusByUser(owner: string): Promise<Action[]>{
  return (await leadsActions$).filter(p => p.owner === owner);
}

export async function getStatusByArea(area: string): Promise<Action[]>{
  return (await leadsActions$).filter(p => p.area === area);
}

export async function getStatusByRegion(region: string): Promise<Action[]>{
  return (await leadsActions$).filter(p => p.region === region);
}





//dodanie statusu i update statusu kontaktu 
export async function addStatus(statusData: any){

  const successStatus = (await leadsActions$).find(status => status.lead_id === statusData.lead_id && status.status === "Sukces");

  if (successStatus !== undefined && successStatus.status === "Sukces"){
    return false
  }else{
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
}


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
    let leadObj = (await leads$).filter(p => p.owner === data.user);
    let leadObjOne = (await leads$).filter(p => p.owner === data.user && p.type==="Życie");
    let leadObjTwo = (await leads$).filter(p => p.owner === data.user && p.type==="Majątek");

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
    let leadObj = (await leads$).filter(p => p.area === data.area);
    let leadObjOne = (await leads$).filter(p => p.area === data.area && p.owner === "");
    let leadObjTwo = (await leads$).filter(p => p.area === data.area && p.owner !=="");

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
}


// dane o statusach do wykresu 
export async function statusToCharts(data:{user?:string, area?:string, region?: string}) {

  let statusLabel  = [];
  let statusValue = [];
  let tabData =[];
  let leadObj;

if(data.user){
  leadObj = (await leads$).filter(p => p.owner === data.user);
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
  leadObj = (await leads$).filter(p => p.area === data.area && p.status === "Sukces");
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

  let chartsData = {
    statusLabel: statusLabel,
    statusValue: statusValue,
  }
  return chartsData
}


//--------------------POBRANIE DANYCH O KAMPANIACH----------------------

export async function getCampaign(): Promise<Campaign[]>{
  return (await campaigns$);
}


//-------------------POBRANIE DANYCH DO PORTFELA------------------------

//pobranie danych o prowizjach dla agenta 
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
  }else 
    return []
}

//pobranie danych o wydatach agenta na kontakty
export async function ownLeadWallet(user:string) {
  let ownLeadTab = [];
  let leadObj = (await leads$).filter(p => p.owner === user);
  let statusObj = (await leadsActions$).filter(p => (p.status === "Kupiony" || p.status === "Własny") && p.owner === user);

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

export async function getBilansSummaryData(data:{area:string}){
  let dataToSelect = [];
  let statusObj = (await leadsActions$).filter(p => p.area === data.area);
  statusObj.forEach(el => {
    dataToSelect.push(el.date.substr(0,7))
  });
  const tabSet = [...new Set(dataToSelect)].sort();
  let dataToSelectSend = ['Wszystkie', ...tabSet];
  return(dataToSelectSend)
};

//pobranie danych do bilansu 
export async function getBilansSummary(data:{area?:string, region?: string; period:string}) {

  if(data.area){
    return await AreaCalculation(data.area, data.period)
  };
};

 async function AreaCalculation(area:string, period:string){
  let returnTab: Bilans[] = [];
    let userArea = (await user$).filter(user => user.area === area && user.active && user.role==="agent");

    if(userArea.length > 0 ){ 

      return await loopAwait(userArea,returnTab, period);

      async function loopAwait (userArea, returnTab, period: string ){

      await userArea.forEach(async(agent: User) => {
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

        if(period === "Wszystkie"){
        //wszystkie leady i sukcesy użykownika
          leadObj = (await leads$).filter(p => p.owner === agent.nick);
          statusObj = (await leadsActions$).filter(p => p.status === "Sukces" && p.owner === agent.nick);
        }else{
          //wszystkie leady i sukcesy użykownika
          leadObj = (await leadsActions$).filter(p => p.owner === agent.nick && p.status === "Kupiony" && p.date.substr(0,7) === period);
          statusObj = (await leadsActions$).filter(p => p.owner === agent.nick && p.status === "Sukces" && p.date.substr(0,7) === period);
        }

        if(leadObj.length > 0){
          //liczba leadów
          count_lead_b = leadObj.length;
          //liczba sukcesów
          count_success_b = (await leads$).filter(p => p.owner === agent.nick && p.status === "Sukces").length;
          //efektywność 
          if( count_lead_b === 0 && count_success_b === 0){effectiveness_b = 0}
          else if(count_success_b === 0){effectiveness_b = 0}
          else{effectiveness_b = Math.round((count_success_b/count_lead_b)*100)};
          //suma wydatków
          leadObj.forEach(el => {
            expense_b += el.price 
          });
        };

        if(statusObj.length > 0){
          //sukcesy użtkownika
          statusObj.forEach(el => {
            income_b += el.income
          });
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
      });
      return  returnTab
    };
  }
  };