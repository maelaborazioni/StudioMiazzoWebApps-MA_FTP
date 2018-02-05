/**
 * @type {Number}
 * 
 * @properties={typeid:35,uuid:"700F3C10-8524-469E-ABF0-484E608005BF",variableType:8}
 */
var _idSystemNews = null;
/**
 * @properties={typeid:35,uuid:"54FC9947-DEEA-455E-B769-1253B40EC966",variableType:-4}
 */
var _arrIdSystemNews = [];
/**
 * @type {String}
 * 
 * @properties={typeid:35,uuid:"7A1E2FAC-C947-47E8-9B3C-E5C41C906F00"}
 */
var _programName = null;
/**
 * @type {String}
 * 
 * @properties={typeid:35,uuid:"D950F322-51FB-45E0-BE8F-51AEB3DF94B7"}
 */
var _htmlTxt = null;

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"BE7611C6-8EE8-47B7-820C-402C67151154"}
 */
function onActionConfermaLettura(event)
{
	var params = {
        processFunction: process_conferma_lettura,
        message: '', 
        opacity: 0.5,
        paneColor: '#434343',
        textColor: '#EC1C24',
        showCancelButton: false,
        cancelButtonText: '',
        dialogName : '',
        fontType: 'Arial,4,25',
        processArgs: [event]
    };
	plugins.busy.block(params);
}

/**
 * @param {JSEvent} event
 *
 * @properties={typeid:24,uuid:"E9BCDDF9-C55B-496E-9CCF-8B9B926E765A"}
 */
function process_conferma_lettura(event)
{
	try
	{
		/** @type{JSFoundset<db:/ma_news/utenti_newsread>} */
		var fs = databaseManager.getFoundSet(globals.Server.MA_NEWS,globals.Table.UTENTI_NEWS_READ);
		
		databaseManager.startTransaction();
		var rec = fs.getRecord(fs.newRecord());
		
		rec.idsystemnews = foundset.idsystemnews;
		rec.programname = foundset.programname;
		rec.idutente = globals.svy_sec_lgn_user_id;
		rec.read_data = globals.TODAY;
		
		if(!databaseManager.commitTransaction())
		{
			databaseManager.rollbackTransaction();
			globals.ma_utl_showWarningDialog('Errore durante il salvataggio della conferma di lettura','News');
		}
	}
	catch(ex)
	{
		var msg = 'Metodo process_conferma_lettura : ' + ex.message;
		globals.ma_utl_showErrorDialog(msg)
		globals.ma_utl_logError(msg,LOGGINGLEVEL.ERROR);
	}
	finally
	{
		globals.svy_mod_closeForm(event);
	    plugins.busy.unblock();	
	}
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"02C6F5F8-CA88-4385-855F-B60F4A7CB2E9"}
 */
function onActionAnnullaLettura(event)
{
	globals.svy_mod_closeForm(event);
}

/**
 * Handle record selected.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"50AE874D-36BF-46B9-815A-C41AA02A3534"}
 */
function onRecordSelection(event) 
{
	if(foundset.getSelectedRecord())
	{
		var recNews = foundset.getSelectedRecord();
		var path = "https://www.studiomiazzo.it/news/" + recNews.programname + '/';
		if(recNews.programversion != '')
			path += ('Ver' + utils.stringReplace(recNews.programversion,'.','_') + '/index.html');
		else
			path += ('InternalNews/Protocol_' + utils.stringReplace(recNews.protocol,'.','_') + '/index.html');
				
		var htmlText = '<iframe src=' + path + ' height="500px" width="840px"/>';
		
		_htmlTxt = htmlText;
		
		elements.btn_next.enabled = foundset.getSelectedIndex() != foundset.getSize(); 
		elements.btn_previous.enabled = foundset.getSelectedIndex() != 1;
	}
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"7A2B1FD4-0315-4C97-AA16-BAEE02CD34AD"}
 */
function dc_prev(event)
{
    globals.svy_utl_setSelectedIndexPrevious(controller.getName());
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"DC0DD9EE-6727-4371-895A-56D174B4EE08"}
 */
function dc_next(event) 
{
   globals.svy_utl_setSelectedIndexNext(controller.getName());
}

/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"27FD30BE-32DC-4B56-BBCD-0EA5B51CADE3"}
 * @AllowToRunInFind
 */
function onShow(firstShow, event) 
{
	plugins.busy.prepare();
	
	var enabled = foundset.getSize() ? true : false;
	elements.btn_next.enabled = enabled && foundset.getSelectedIndex() != foundset.getSize(); 
	elements.btn_previous.enabled = enabled && foundset.getSelectedIndex() != 1;
	elements.btn_confirm_all.enabled = enabled;
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"104D31EC-C1FD-4D58-AB12-86649BFBDFD9"}
 */
function onActionConfermaLetturaAll(event) 
{
	var params = {
        processFunction: process_conferma_lettura_all,
        message: '', 
        opacity: 0.5,
        paneColor: '#434343',
        textColor: '#EC1C24',
        showCancelButton: false,
        cancelButtonText: '',
        dialogName : '',
        fontType: 'Arial,4,25',
        processArgs: [event]
    };
	plugins.busy.block(params);
}

/**
 * @param {JSEvent} event
 *
 * @properties={typeid:24,uuid:"F492E705-DB59-4A4E-94A3-F6C4C011039A"}
 */
function process_conferma_lettura_all(event)
{
	try
	{
		/** @type{JSFoundset<db:/ma_news/utenti_newsread>} */
		var fs = databaseManager.getFoundSet(globals.Server.MA_NEWS,globals.Table.UTENTI_NEWS_READ);
		
		databaseManager.startTransaction();
		
		for(var f = 1; f <= foundset.getSize(); f++)
		{
			var rec = fs.getRecord(fs.newRecord());
		
			rec.idsystemnews = foundset.getRecord(f).idsystemnews;
			rec.programname = foundset.getRecord(f).programname;
			rec.idutente = globals.svy_sec_lgn_user_id;
			rec.read_data = globals.TODAY;
		}
		
		if(!databaseManager.commitTransaction())
		{
			databaseManager.rollbackTransaction();
			globals.ma_utl_showWarningDialog('Errore durante il salvataggio della conferma di lettura','News');
		}
	}
	catch(ex)
	{
		var msg = 'Metodo process_conferma_lettura_all : ' + ex.message;
		globals.ma_utl_showErrorDialog(msg)
		globals.ma_utl_logError(msg,LOGGINGLEVEL.ERROR);
	}
	finally
	{
		globals.svy_mod_closeForm(event);
		plugins.busy.unblock();
	}
}

/**
 * Handle hide window.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @returns {Boolean}
 *
 * @private
 *
 * @properties={typeid:24,uuid:"90595DBB-6DCB-4268-B97F-7A3E718BDC6D"}
 */
function onHide(event) 
{
	// Verifica per le ditte del gruppo se sono presenti sull'ftp dati inviati dalla sede
	// e in caso affermativo lancia la ricezione automatica (nell'ordine tabelle generali/ditta/certificati telematici)
	if (globals.ma_utl_hasKey(globals.Key.RILEVAZIONE_PRESENZE)
		&& globals.ma_utl_getSoftware(globals.Module.RILEVAZIONE_PRESENZE) != globals.ModuleSoftware.PRESENZA_SEMPLICE_LITE) 
		globals.verificaDatiFtp();
	return true;
}
