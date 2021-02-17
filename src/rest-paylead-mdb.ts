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
  getDirectorByRegion,
  addNewAgent,
  changeDataUser,
  deactivateAgent,
  getStatusByArea,
  getStatusByRegion,
  getBilansSummaryData,
  getUsersByRegion,
  changeAreaUser,
  getUsersAll,
  addNewNotAgent,
  getLeadsOwnAll,
  deleteLead,
  PasswordRecovery,
  addLeadFromCsv,
  getBilansSummaryArea,
  getBilansSummaryRegion,
} from './db-paylead-mdb';

export const router = express.Router();
router.use(cors());
router.use(express.json());

//ścieżka do logowania użytkownika
router.get('/', async (req: express.Request, res: express.Response) => {
  res.send("Aplikacja paylead działa poprawnie");
});

//ścieżka do logowania użytkownika
router.post('/login', async (req: express.Request, res: express.Response) => {
  res.json(await getUserToLogin(req.body));
});

//ścieżka do logowania użytkownika
router.post('/password_recovery', async (req: express.Request, res: express.Response) => {
  res.json(await PasswordRecovery(req.body));
});

//pobranie innych użytkowników należacych do twojego obszaru 
router.get('/structure_all', async (req: express.Request, res: express.Response) => {
  res.json(await getUsersAll());
});

//pobranie innych użytkowników należacych do twojego obszaru 
router.post('/structure_area', async (req: express.Request, res: express.Response) => {
  res.json(await getUsersByArea(req.body));
});

//pobranie innych użytkowników należacych do twojego obszaru 
router.post('/structure_region', async (req: express.Request, res: express.Response) => {
  res.json(await getUsersByRegion(req.body));
});

//pobranie innych użytkowników należacych do twojego obszaru 
router.post('/structure_director', async (req: express.Request, res: express.Response) => {
  res.json(await getDirectorByRegion(req.body));
});

//dodawanie nowego agenta
router.post('/add_agent', async (req: express.Request, res: express.Response) => {
  res.json(await addNewAgent(req.body));
});

//dodawanie nowego dyrektora regionu
router.post('/add_director', async (req: express.Request, res: express.Response) => {
  res.json(await addNewNotAgent(req.body));
});

//zmiana danych użytkownika
router.post('/change_agent', async (req: express.Request, res: express.Response) => {
  res.json(await changeDataUser(req.body));
});

//zmiana obszaru agenta
router.post('/change_area_agent', async (req: express.Request, res: express.Response) => {
  res.json(await changeAreaUser(req.body));
});

//zmiana danych użytkownika
router.post('/deactivate_agent', async (req: express.Request, res: express.Response) => {
  res.json(await deactivateAgent(req.body));
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
  }else if (req.body.role === "area"){
    res.json(await getLeadsOwnByArea(req.body.type));

  //pobieranie własnyvh leadów dla dyrektora regionu
  }else if(req.body.role ==="region"){
    res.json(await getLeadsOwnByRegion(req.body.type));
  
    //pobieranie wszystkich leadów
  }else if(req.body.role ==="admin"){
  res.json(await getLeadsOwnAll());
}
});

//ścieżka do dodawania leada z własnego konta 
router.post('/lead_add_agent', async (req: express.Request, res: express.Response) => {
    res.json(await addLeadOwn(req.body));
});

//ścieżka do dodawania leada z własnego konta 
router.post('/lead_add_csv_file', async (req: express.Request, res: express.Response) => {
  res.json(await addLeadFromCsv(req.body));
});

//ścieżka do usuwania leada 
router.post('/lead_delete', async (req: express.Request, res: express.Response) => {
  res.json(await deleteLead(req.body));
});

//pobranie danych o kampaniach do wykresów
router.post('/lead_to_charts', async (req: express.Request, res: express.Response) => {
  res.json(await leadToCharts(req.body));
});

//pobranie danych o statusach do wykresów
router.post('/status_to_charts', async (req: express.Request, res: express.Response) => {
  res.json(await statusToCharts(req.body));
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

  else if(req.body.area){
    res.json(await getStatusByArea(req.body.area));
  }

  else if(req.body.region){
    res.json(await getStatusByRegion(req.body.region));
  }

  else if(req.body.region){
    res.json(await getStatusByRegion(req.body.region));
  }
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


//pobranie danych o pobrnie danych o rozliczeniu 
router.post('/bilans_summary_area', async (req: express.Request, res: express.Response) => {
  res.json(await getBilansSummaryArea(req.body));
});

//pobranie danych o pobrnie danych o rozliczeniu 
router.post('/bilans_summary_region', async (req: express.Request, res: express.Response) => {
  res.json(await getBilansSummaryRegion(req.body));
});


//pobranie danych o pobrnie danych o rozliczeniu 
router.post('/bilans_summary_date', async (req: express.Request, res: express.Response) => {
  res.json(await getBilansSummaryData(req.body));
});

//pobranie danych o kampaniach
router.get('/campaign', async (req: express.Request, res: express.Response) => {
  res.json(await getCampaign());
});