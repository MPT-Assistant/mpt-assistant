import server from "../..";
import timetable from "../../../DB/timetable";

server.route({
    method: ["GET", "POST"],
    url: "/timetable.get",
    handler: () => {
        return timetable;
    },
});
