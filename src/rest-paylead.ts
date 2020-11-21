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
} from './db-paylead';

export const router = express.Router();
router.use(cors());
router.use(express.json());

//ścieżka do logowania użytkownika
router.post('/login', async (req: express.Request, res: express.Response) => {
  res.json(await getUserToLogin(req.body));
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
  if(req.body.role ==="agent"){
    res.json(await getLeadsOwnByUser(req.body.type, req.body.agent));

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