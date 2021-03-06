/* ActionRegistry.js 
 * 
 * copyright (c) 2010-2017, Christian Mayer and the CometVisu contributers.
 * 
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation; either version 3 of the License, or (at your option)
 * any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA
 */


/**
 * Global notification handler that routes messages topic-dependent to different {@link cv.core.notifications.IHandler}
 * (e.g. NotificationCenter, Dialog, Toast, console.log, native notification, internal message bus ...)
 *
 * @author Tobias Bräutigam
 * @since 0.11.0
 */
qx.Class.define("cv.core.notifications.ActionRegistry", {
  type: "static",


  /*
  ******************************************************
    STATICS
  ******************************************************
  */
  statics: {
    __handlers: {},

    registerActionHandler: function(type, handler) {
      if (this.__handlers[type]) {
        qx.log.Logger.warning(this, "there is already an action handler registered for '%1' action. replacing now", type);
      }
      this.__handlers[type] = handler;
    },

    createActionElement: function(type, config) {
      if (!this.__handlers[type]) {
        qx.log.Logger.error(this, "no action handler registered for '%1' action type", type);
        return null;
      } else {
        var actionHandler = new (this.__handlers[type])(config);
        return actionHandler.getDomElement();
      }
    }
  }
});
