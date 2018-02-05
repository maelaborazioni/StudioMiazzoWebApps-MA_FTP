/**
 * Verifica la presenza di eventuali news non ancora lette e le visualizza 
 * in fase di ingresso
 * 
 * @param ownerid
 * @param userid
 * @param program_name
 * @param already_read
 *
 * @properties={typeid:24,uuid:"5B5D7F5F-4A8D-4829-886B-6949D4ADAA8F"}
 * @AllowToRunInFind
 */
function verificaDatiNews(ownerid,userid,program_name,already_read)
{
	// verifica utente/servizio software	
	var arrSwOwner = globals.getIdTabSoftwareFromCodice(globals.ma_utl_getAllSoftwares(ownerid));
	
	if(arrSwOwner.length == 0)
		return false;
	
	var sqlNewsToRead = 'SELECT * \
                       FROM [System_News] SN \
                       WHERE \
                       ProgramName = ? \
                       AND \
                       Cliente = 1 \
                       AND \
                       ( \
                       Protocol IS NULL \
                       OR \
                       Protocol IS NOT NULL \
                       AND \
                       idSystemNews IN (SELECT DISTINCT SN_.idSystemNews \
                       FROM System_News SN_ \
				       INNER JOIN System_News_Services SNS_ \
				       ON SN_.Protocol = SNS_.Protocol \
				       WHERE SNS_.idTabServizioSoftware IN ('.concat(arrSwOwner.map(function(sw){return sw}).join(','))
						+ ')))'; 
	var arrNewsToRead = [program_name];
	
	if(already_read)
	{
		sqlNewsToRead += ' AND idSystemNews NOT IN \
                       (SELECT idSystemNews \
                        FROM Utenti_NewsRead \
    					WHERE idUtente = ? ) ';
		
	    arrNewsToRead.push(globals.svy_sec_lgn_user_id);
	}
	
	var dsNewsToRead  = databaseManager.getDataSetByQuery(globals.Server.MA_NEWS,sqlNewsToRead,arrNewsToRead,-1);
	if(dsNewsToRead && dsNewsToRead.getMaxRowIndex())
	{
		/** @type {JSFoundset<db:/ma_news/System_News>}*/
		var fsNews = databaseManager.getFoundSet(globals.Server.MA_NEWS,globals.Table.SYSTEM_NEWS);
		fsNews.find();
		fsNews.idsystemnews = dsNewsToRead.getColumnAsArray(1); // idSystemNews
		fsNews.search();
		
		if(fsNews.getSize() == 0)
			return false; 
		
		var frm = already_read ? forms.ma_news : forms.ma_news_all;
		frm.foundset.loadRecords(dsNewsToRead);
		globals.ma_utl_showFormInDialog(frm.controller.getName(),already_read ? 'News' : 'Registro news');
		return true;
	}
	
	return false;
}

/**
 * @properties={typeid:24,uuid:"CBFA05DA-6E30-41C0-82E3-1E5C3C892B2F"}
 */
function selezione_news()
{
	verificaDatiNews(globals.svy_sec_lgn_owner_id,globals.svy_sec_lgn_user_id,'StudioMiazzoWebApps',false);
}