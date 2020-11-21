import * as fs from 'fs';
import * as util from 'util';
import { User } from './models/User';
import { LoginData } from './models/LoginData';
import { LoginRes } from './models/LoginRes'
import { Lead } from './models/Lead'
import { Action } from './models/Action';

type USER = User[];
type LEAD = Lead[];
type ACTION = Action [];


const readFile = util.promisify(fs.readFile);

const user$: Promise<USER> = readFile('./data/users.json', 'utf8')
  .then(JSON.parse, console.error);

const leads$: Promise<LEAD> = readFile('./data/leads.json', 'utf8')
  .then(JSON.parse, console.error)

const leadsActions$: Promise<ACTION> = readFile('./data/leads_actions.json', 'utf8')
  .then(JSON.parse, console.error)



//logowanie użytkownika
export async function getUserToLogin(loginData: LoginData): Promise<LoginRes> {
  const user = (await user$).find(user => user.nick === loginData.nick);
  if(user !== undefined){
    if(user.password === loginData.password)
      return ({loginError:false, loginUser: user})
    else
      return ( {loginError:true})
  }
  else
    return ( {loginError:true})
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

export async function getLeadsOwnByUser(area: string, user: string): Promise<Lead[]>{
  return (await leads$).filter(p => p.owner === user && p.area === area);
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
    status: lead.status
  };

  (await leads$).push(newLead);
  (await leadsActions$).push(action);

  return true
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
    status: lead.status
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
      area: lead.area
    };

  leadToBuy.push(onelead)
  })
return leadToBuy
}

