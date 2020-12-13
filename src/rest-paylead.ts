import * as cors from 'cors';
import * as express from 'express';
import {
  getUserToLogin,
  getLeadsToBuyByArea,
  getLeadsToBuyByRegion,
  updateBuyLead,
  getLeadsOwnByUser,
  getLeadsOwnByArea,
  getLeadsOwnByRegion,
  addLeadOwn,
  getStatusById,
  getLeadsOwnById,
  addStatus,
  getUsersByArea,
  changePassword,
  getStatusByUser,
  leadToCharts,
  statusToCharts,
  getCampaign,
  leadCommision,
  ownLeadWallet,
} from './db-paylead';

export const router = express.Router();
router.use(cors());
router.use(express.json());


//ścieżka do logowania użytkownika
router.post('/login', async (req: express.Request, res: express.Response) => {
  res.json(await getUserToLogin(req.body));
});

//pobranie innych użytkowników należacych do twojego obszaru 
router.post('/structure', async (req: express.Request, res: express.Response) => {
  res.json(await getUsersByArea(req.body));
});

//zmiana hasła
router.post('/change_password', async (req: express.Request, res: express.Response) => {
  res.json(await changePassword(req.body));
});


//zwracanie leadów do kupienia w zalezniści od roli i obszaru
router.post('/lead_buy', async (req: express.Request, res: express.Response) => {

  //jeżeli jest wysłana tylko kto chce kupić leada, nic nie zwraca
  if(req.body.agent){
    await updateBuyLead(req.body.agent, req.body.lead_id);
  }

  //zeraca wszystkie leady do kupienia dla uzytkownika o roli agenta 
  if(req.body.role ==="agent"){
    res.json(await getLeadsToBuyByArea(req.body.type));

  //zwraca wszystkie leady do kupienia dla użytkownika o roli dyretora sieci
  }else if (req.body.role ==="area"){
    res.json(await getLeadsToBuyByArea(req.body.type));
  //zwraca wszystkie leadt do kupienia dla użytkownika o roli dyrektora obszaru
  }else if(req.body.role ==="region"){
    res.json(await getLeadsToBuyByRegion(req.body.type));
  };
});


//ścieżka do zwracania leadów własnych
router.post('/lead_own', async (req: express.Request, res: express.Response) => {

  //pobieranie własnego leada po identyfikatorze
   if(req.body.lead_id){
    res.json(await getLeadsOwnById(req.body.lead_id));
  }

  //pobieranie własnych leadów po nicku agenta
  else if(req.body.agent){
    res.json(await getLeadsOwnByUser(req.body.agent));

  //pobieranie własnych leadów dla dyrektora obszaru 
  }else if (req.body.role ==="area"){
    res.json(await getLeadsOwnByArea(req.body.type));

  //pobieranie własnyvh leadów dla dyrektora regionu
  }else if(req.body.role ==="region"){
    res.json(await getLeadsOwnByRegion(req.body.type));
  }
});

//ścieżka do dodawania leada z własnego konta 
router.post('/lead_add_agent', async (req: express.Request, res: express.Response) => {
    res.json(await addLeadOwn(req.body));
});

//pobranie danych o kampaniach do wykresów
router.post('/lead_to_charts', async (req: express.Request, res: express.Response) => {
  res.json(await leadToCharts(req.body.user));
});

//pobranie danych o statusach do wykresów
router.post('/status_to_charts', async (req: express.Request, res: express.Response) => {
  res.json(await statusToCharts(req.body.user));
});

//pobranie danych o statusach
router.post('/status_get', async (req: express.Request, res: express.Response) => {

  //pobranie danych o statusach po indentyfikatorze
  if(req.body.lead_id){
    res.json(await getStatusById(req.body.lead_id));
  } 

  //pobranie danych o statusach po nicku właściciela
  else if(req.body.owner){
    res.json(await getStatusByUser(req.body.owner));
  }

  //kolejne bobierania dla użytkownika area i region i all-------------------------------------

});

//ścieżka do zwracania statusów
router.post('/status_post', async (req: express.Request, res: express.Response) => {
  res.json(await addStatus(req.body));
  //kolejne bobierania dla użytkownika area i region i all-----------------------------
});


//pobranie danych o prowizjach
router.post('/commision', async (req: express.Request, res: express.Response) => {
  res.json(await leadCommision(req.body.user));
});

//pobranie danych o kosztach kupionych leadów
router.post('/own_lead_wallet', async (req: express.Request, res: express.Response) => {
  res.json(await ownLeadWallet(req.body.user));
});

//pobranie danych o kampaniach
router.get('/campaign', async (req: express.Request, res: express.Response) => {
  res.json(await getCampaign());
});

