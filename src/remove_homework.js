import Dexie from "dexie";
import OpenDB from "./show_homework"

async function RemoveData(e) {
    console.log("pushed")
    var db = await OpenDB()
    db.table('hw_store').delete(hw_id)
}

RemoveData()