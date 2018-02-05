
/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"BC18EEBC-8D33-49DF-B7A9-AADEC435BB9A"}
 */
function onShow(firstShow, event) 
{
//	return _super.onShow(firstShow, event)
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
 * @properties={typeid:24,uuid:"ED208877-40ED-498D-A707-A0FA9E5A8D0E"}
 */
function onHide(event) 
{
   globals.svy_mod_closeForm(event);
   return true;
}
