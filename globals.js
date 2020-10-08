/**
 * Aggiorna la modalità di acquisizione dei dati generali
 * 
 * @param params
 *
 * @properties={typeid:24,uuid:"B65026C2-94A4-4541-A060-101A59230F66"}
 */
function aggiornaDatiVersione(params)
{
	var url = globals.WS_LU + "/Lu32/UpdateVersionData";
    var response = globals.getWebServiceResponse(url, params);
   
    if (response && response.StatusCode == HTTPStatusCode.OK)
    	return response.ReturnValue;
	 
    globals.ma_utl_showErrorDialog('Errore durante l\'aggiornamento della versione su ftp', 'Aggiornamento dati versione');	
	return false;
 }

/**
 * Lancia l'operazione lunga di ricezione tabelle ditta/dipendenti
 * 
 * @param {Object} [params]
 *
 * @properties={typeid:24,uuid:"D8016E14-D10D-43A6-9E1A-1C20562A85EE"}
 */
function riceviTabelleDitta(params)
{
	// add new operation info for future updates
	var operation = scopes.operation.create(params['idditta'],globals.getGruppoInstallazioneDitta(params['idditta']),params['periodo'],globals.OpType.RTDD);
	if(operation == null || operation.operationId == null)
	{
		globals.ma_utl_showErrorDialog('Errore durante la preparazione dell\'operazione lunga. Riprovare o contattare il  servizio di Assistenza.');
		return;
	}
	params.operationid = operation.operationId;
	params.operationhash = operation.operationHash;
	
	var ftpUrl = globals.WS_LU + "/Lu32/ImportFactoryTableDataAsync";
	addJsonWebServiceJob(ftpUrl,
		                 params,
						 vUpdateOperationStatusFunction);
}

/**
 * Lancia l'operazione lunga di ricezione delle tabelle generali
 * 
 * @param {Object} params
 *
 * @properties={typeid:24,uuid:"068C1369-7482-479E-9C6F-EF76A48EAD22"}
 */
function riceviTabelleGenerali(params)
{	
	// add new operation info for future updates
	var operation = scopes.operation.create(params['idditta'],globals.getGruppoInstallazioneDitta(params['idditta']),params['periodo'],globals.OpType.RTG);
	if(operation == null || operation.operationId == null)
	{
		globals.ma_utl_showErrorDialog('Errore durante la preparazione dell\'operazione lunga. Riprovare o contattare il  servizio di Assistenza.');
		return;
	}
	params.operationid = operation.operationId;
	params.operationhash = operation.operationHash;
	
	var ftpUrl = globals.WS_LU + "/Lu32/ImportGeneralTableDataAsync";
	addJsonWebServiceJob(ftpUrl,
		                 params,
						 vUpdateOperationStatusFunction,
						 null,
						 riceviTabelleDitta);
}

/**
 * Lancia l'operazione lunga di ricezione dei dati inviati dallo studio nel seguente ordine :
 * - tabelle generali
 * - tabelle ditta
 * 
 * @param params
 * @param arrDitte
 * 
 * @properties={typeid:24,uuid:"08FC4B13-C51D-4D23-8BEC-0F0899D9D0BB"}
 */
function riceviTabelleDittaDipendenti(params,arrDitte)
{	
	// add new operation info for future updates
	var operation = scopes.operation.create(params['idditta'],globals.getGruppoInstallazioneDitta(params['idditta']),params['periodo'],globals.OpType.RTG);
	if(operation == null || operation.operationId == null)
	{
		globals.ma_utl_showErrorDialog('Errore durante la preparazione dell\'operazione lunga. Riprovare o contattare il  servizio di Assistenza.');
		return;
	}
	params.operationid = operation.operationId;
	params.operationhash = operation.operationHash;
	var ftpUrl = globals.WS_LU + "/Lu32/ImportGeneralTableDataAsync";
	addJsonWebServiceJob(ftpUrl,
		                 params,
						 vUpdateOperationStatusFunction,
						 null
						 ,function(_retObj)
						 {
							 /** @type {{statusCode:Number, returnValue:Object, message:String, operationId:String, 
			                    operationHash:String, status:Number, start:Date, end:Date, progress:Number, lastProgress:Date}} */
					         var retObj = _retObj;
							 if(retObj && retObj.status == 255)
							 {
							   	plugins.busy.unblock();
								globals.ma_utl_showWarningDialog('L\'operazione di ricezione delle tabelle generali non è terminata correttamente. <br/>Contattare il servizio di assistenza per ulteriori informazioni.','Ricezione dati ditta/dipendenti');	
								return;
							 }
							 riceviTabelleDitte(params,arrDitte);
							 forms.mao_history.operationDone(retObj)
						 });
}

/**
 * Lancia l'operazione lunga di ricezione delle tabelle anagrafiche
 * (acquisisce per la prima ditta dell'array, costruisce un array aggiornato con le ditte restanti e poi effettua una ricorsione
 * avente come parametro il nuovo array)
 * 
 * @param params
 * @param arrDitte
 *
 * @properties={typeid:24,uuid:"FE920DA1-2DC9-46CC-8A14-88F03027C401"}
 * @AllowToRunInFind
 */
function riceviTabelleDitte(params,arrDitte)
{
	if(arrDitte.length == 0)
	{
		// controlla se ci sono nuovi inserimenti di date di cessazione ed aggiorna la situazione degli utenti
		if(globals.ma_utl_hasModule(globals.Module.AUTORIZZAZIONI))
		   		scopes.users.updateSecUserLavoratori();
	    return;
	}
	
	var currIdDitta = arrDitte[0];
	var arrDitteNew = [];
	
	for(var d = 1; d < arrDitte.length; d++)
		arrDitteNew.push(arrDitte[d]);
		
	var ftpUrl = globals.WS_LU + "/Lu32/ImportFactoryTableDataAsync";
	
	var dParams = globals.inizializzaParametriRiceviTabelle(currIdDitta,
		                                                    globals.getGruppoInstallazioneDitta(currIdDitta),
				                                            "",
															globals.TipoConnessione.CLIENTE);
	// add new operation info for future updates
	var operation = scopes.operation.create(dParams['idditta'],dParams['idgruppoinstallazione'],dParams['periodo'],globals.OpType.RTDD);
	if(operation == null || operation.operationId == null)
	{
		globals.ma_utl_showErrorDialog('Errore durante la preparazione dell\'operazione lunga. Riprovare o contattare il  servizio di Assistenza.');
		return;
	}
	params.operationid = operation.operationId;
	params.operationhash = operation.operationHash;
	addJsonWebServiceJob(ftpUrl,
			             dParams,
						 vUpdateOperationStatusFunction,
						 null,
						 function(_retObj)
						 {
							 /** @type {{statusCode:Number, returnValue:Object, message:String, operationId:String, 
			                    operationHash:String, status:Number, start:Date, end:Date, progress:Number, lastProgress:Date}} */
					         var retObj = _retObj;
							 riceviTabelleDitte(params,arrDitteNew);
							 forms.mao_history.operationDone(retObj);
						 });	   
}

/**
 * Inizializza i parametri per la ricezione dei dati delle tabelle ditta 
 * 
 * @param {Number} _idditta
 * @param {Number} _gruppoinst
 * @param {String} _gruppolav
 * @param {Number} _tipoconnessione
 * @param {Number} [_tipologia]
 * 
 * @properties={typeid:24,uuid:"E4A88E9E-AFF3-47DC-A68F-3E5CD2FC1891"}
 */
function inizializzaParametriRiceviTabelle(_idditta,_gruppoinst,_gruppolav,_tipoconnessione,_tipologia)
{
	return {
		user_id                 : security.getUserName(), 
		client_id               : security.getClientID(),
		idditta                 : _idditta,
		codiceditta             : globals.getCodDitta(_idditta),
		idgruppoinstallazione   : _gruppoinst, 
		gruppolavoratori        : _gruppolav,
		iddipendenti            : [],
		periodo                 : TODAY.getFullYear() * 100 + (TODAY.getMonth() + 1),
		tipoconnessione         : _tipoconnessione,
		tipologiaverifica       : _tipologia != null ? _tipologia : 0
	};
}

/**
 * Verifica la presenza o meno dei dati nella directory ftp
 * 
 * @param {{
 *				idditta                 : Number,
 *              codiceditta             : Number,
 *				idgruppoinstallazione   : Number,
 *				gruppolavoratori        : String,
 *				iddipendenti            : Array<Number>,
 *				periodo                 : Number
 *		   }} 	   params
 * @param {Number} [tipologia]
 * 
 * @return Boolean
 * 
 * @properties={typeid:24,uuid:"009BDF1E-7B2D-42E1-8B69-428645FDAE90"}
 */
function verificaDatiSuFtp(params, tipologia)
{
	var url = globals.WS_LU + "/Ftp32/VerifyTableData";
    var response = globals.getWebServiceResponse(url, params);
    
    if (response && response.StatusCode == HTTPStatusCode.OK)
       return response.ReturnValue;
    else 
    {
       globals.ma_utl_showErrorDialog('Errore durante la verifica della presenza di dati su ftp', 'Verifica presenza di dati da acquisire');	
       return false;
    }
}

/**
 * Verifica la presenza di dati ditta/dipendente inviati dallo studio e non ancora acquisiti.
 * Restituisce true se presenti, false altrimenti
 * 
 * @param {Number} idDitta
 * @param {Number} idGruppoInst
 * 
 * @properties={typeid:24,uuid:"263F2E2B-1EAF-4775-84E9-2BD3A268E5CC"}
 */
function verificaDatiDittaFtp(idDitta,idGruppoInst)
{
	var params = inizializzaParametriRiceviTabelle(idDitta,
		                                           idGruppoInst,
												   "",
												   globals.TipoConnessione.CLIENTE,
												   0);
    if(verificaDatiSuFtp(params))
	   return true;
		
	return false;
}

/**
 * Verifica,in fase di prima entrata nell'applicazione, per tutte le ditte del gruppo, se sono presenti dati inviati dallo studio e non ancora acquisiti.
 * In caso di presenza di dati, viene richiesto all'utente se desidera procedere con l'acquisizione e, in caso positivo,
 * vengono lanciate le operazioni di acquisizione per le ditte che possiedono tali dati
 *  
 * @AllowToRunInFind
 *
 * @properties={typeid:24,uuid:"FB1A546E-1BA2-4A66-9F85-28ECDC87915A"}
 */
function verificaDatiFtp()
{
	// aggiorna sempre la versione del cliente
    var versionParams = {
    	server          : globals.server_db_name,   
    	databasecliente : globals.customer_db_name
    }
//    if(!globals.aggiornaDatiVersione(versionParams))
//    {
//    	plugins.busy.unblock();
//    	return;
//    }
	
	var ditte;
	/** @type {Array<Number>}*/
	var arrDitteConDati = [];
	var msg = '<html>Sono presenti nuovi dati inviati dallo studio e non ancora acquisiti per ';
	/** @type {JSFoundSet<db:/ma_anagrafiche/ditte>}*/
	var fs = databaseManager.getFoundSet(globals.Server.MA_ANAGRAFICHE,globals.Table.DITTE);
    if(fs.find())
    {
    	fs.tipologia = [globals.Tipologia.STANDARD,globals.Tipologia.GESTITA_UTENTE];
//    	fs.idcliente = '!^';
    	ditte = fs.search();
    	ditte > 1 ? msg += 'le ditte : ' : msg += 'la ditta : ';
        msg += '<br/>';
    	for(var i = 1; i <= ditte; i++)
    	{
    		if(verificaDatiDittaFtp(fs.getRecord(i).idditta,
    			                    globals.getGruppoInstallazioneDitta(fs.getRecord(i).idditta)))
    		{
    			arrDitteConDati.push(fs.getRecord(i).idditta);
    			msg += globals.getCodDitta(fs.getRecord(i).idditta) + ' - ' + globals.getRagioneSociale(fs.getRecord(i).idditta) + '<br/>';
    		}
    	}
    	
    	msg += 'Procedere con l\'acquisizione dei dati?';
    	    	
    }
    
    plugins.busy.unblock();
    
    if(arrDitteConDati.length > 0)
    {
    	var idGruppoInstallazione = globals.getGruppoInstallazioneDitta(arrDitteConDati[0]);
//    	var codDitta = globals.getCodiceDittaPrincipaleGruppoInstallazione(idGruppoInstallazione);
//    	
//    	// controllo per caso commercialisti Hexelia
//    	var idDitta = isCodiceDittaDisponibile(codDitta) ? arrDitteConDati[0] : globals.getIdDitta(codDitta);
    	var idDitta = arrDitteConDati[0];
    	
    	// acquisizione sincrona delle tabelle generali per la sola ditta principale associata al gruppo di installazione
    	var params = globals.inizializzaParametriRiceviTabelle(idDitta,
    		    						                       idGruppoInstallazione,
    			    										   '',
    				    									   globals.TipoConnessione.CLIENTE);
    	    	
    	var answer = globals.ma_utl_showYesNoQuestion(msg,'Ricevi tabelle ditta/dipendenti');
    	if (answer)
    		// ricezione tabelle generali ditta principale seguita da ricezione asincrona tabelle ditta/dipendenti
    		// delle altre ditte interessate
    		riceviTabelleDittaDipendenti(params,arrDitteConDati);
    	   	
    }
    
}

/**
 * Restituisce il dataset contenente i certificati telematici che risultano ancora da acquisire
 * per la ditta con identificativo idDitta nel periodo periodo
 * 
 * @param {Number} idDitta
 * @param {Number} periodo
 *
 * @return {JSDataSet}
 * 
 * @properties={typeid:24,uuid:"BD1C3F3D-B7BC-4D5E-9CAD-6831BB1A5A94"}
 */
function getCertificatiTelematiciDaAcquisire(idDitta,periodo)
{
	var sqlProc = 'EXEC dbo.S_Telematici_Certificati_DaImportare ?,?';
	var typesProc = [0,0];
	var arrProc = [idDitta,periodo];
	var ds = plugins.rawSQL.executeStoredProcedure(globals.getSwitchedServer(globals.Server.MA_PRESENZE),
		                                           sqlProc,
												   arrProc,
												   typesProc,
												   1000);
	return ds;
}