import * as cors from 'cors';
import * as express from 'express';
import {
  getUserToLogin,
  getLeadsToBuyByArea,
  getLeadsToBuyByRegion,
  getLeadsToBuy,
  updateBuyLead,
  getLeadsOwnByUser,
  getLeadsOwnByArea,
  getLeadsOwnByRegion,
  getLeadsOwn,
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

router.post('/structure', async (req: express.Request, res: express.Response) => {
  res.json(await getUsersByArea(req.body));
});

router.post('/change_password', async (req: express.Request, res: express.Response) => {
  res.json(await changePassword(req.body));
});


//ścieżka do zwracania leadów do kupienia w zalezniści od roli i obszaru
router.post('/lead_buy', async (req: express.Request, res: express.Response) => {

  if(req.body.agent){
    await updateBuyLead(req.body.agent, req.body.lead_id);
  }

  if(req.body.role ==="agent"){
    res.json(await getLeadsToBuyByArea(req.body.type));

  }else if (req.body.role ==="area"){
    res.json(await getLeadsToBuyByArea(req.body.type));

  }else if(req.body.role ==="region"){
    res.json(await getLeadsToBuyByRegion(req.body.type));

  }else{
    res.json(await getLeadsToBuy());
  };
});


//ścieżka do zwracania leadów własnych
router.post('/lead_own', async (req: express.Request, res: express.Response) => {

   if(req.body.lead_id){
    res.json(await getLeadsOwnById(req.body.lead_id));
  }

  else if(req.body.agent){
    res.json(await getLeadsOwnByUser(req.body.agent));

  }else if (req.body.role ==="area"){
    res.json(await getLeadsOwnByArea(req.body.type));

  }else if(req.body.role ==="region"){
    res.json(await getLeadsOwnByRegion(req.body.type));

  }else{
    res.json(await getLeadsOwn());
  };
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


//ścieżka do zwracania statusów
router.post('/status_get', async (req: express.Request, res: express.Response) => {
  if(req.body.lead_id){
    res.json(await getStatusById(req.body.lead_id));
  } 
  else if(req.body.owner){
    res.json(await getStatusByUser(req.body.owner));
  }

  //kolejne bobierania dla użytkownika area i region i all

});

//ścieżka do zwracania statusów
router.post('/status_post', async (req: express.Request, res: express.Response) => {
  res.json(await addStatus(req.body));
  //kolejne bobierania dla użytkownika area i region i all
});


//pobranie danych o kampaniach do wykresów
router.post('/commision', async (req: express.Request, res: express.Response) => {
  res.json(await leadCommision(req.body.user));
});

//pobranie danych o kampaniach do wykresów
router.post('/own_lead_wallet', async (req: express.Request, res: express.Response) => {
  res.json(await ownLeadWallet(req.body.user));
});

//pobranie danych o kampaniach do wykresów
router.get('/campaign', async (req: express.Request, res: express.Response) => {
  res.json(await getCampaign());
});

