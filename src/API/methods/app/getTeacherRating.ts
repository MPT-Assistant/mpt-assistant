import server from "../..";

import raUtils from "@rus-anonym/utils";
import { Type } from "@sinclair/typebox";
import { signBox } from "../../../lib/miniapp";

import DB from "../../../lib/DB";
import APIError from "../../APIError";

server.post("/app.getTeacherRating" ,{
    schema: {
        body: Type.Object({
            sign: signBox,
            name: Type.String(),
            surname: Type.String(),
            patronymic: Type.String()
        })
    }
}, async (request) => {
    const teacher = await DB.api.models.teachers.findOne({
        name: request.body.name,
        surname: request.body.surname,
        patronymic: request.body.patronymic,
    });

    if (!teacher) {
        throw new APIError({ code: 8, request });
    }

    const score = teacher.rating.find(x => {
        return x.source.type === "vk" &&
        x.source.id === request.body.sign.vk_user_id;
    });

    return {[
  {
    $unwind:
      {
        path: "$schedule",
      },
  },
  {
    $match:
      /**
       * query: The query in MQL.
       */
      {
        "schedule.num": 5,
      },
  },
  {
    $unwind:
      /**
       * path: Path to the array field.
       * includeArrayIndex: Optional name for index.
       * preserveNullAndEmptyArrays: Optional
       *   toggle to unwind null and empty values.
       */
      {
        path: "$schedule.lessons",
      },
  },
  {
    $project:
      /**
       * specifications: The fields to
       *   include or exclude.
       */
      {
        place: "$schedule.place",
        group: "$name",
        week: {
          $indexOfArray: [
            "$schedule.lessons.teacher",
            "П.А. Елистратова",
          ],
        },
        lesson: "$schedule.lessons.num",
      },
  },
  {
    $match:
      /**
       * query: The query in MQL.
       */
      {
        week: 1,
      },
  },
  {
    $project:
      /**
       * specifications: The fields to
       *   include or exclude.
       */
      {
        _id: false,
        group: true,
        place: true,
        lesson: true,
      },
  },
]
        score: score ? score.score : null,
        rating: teacher.rating.length > 0 ? raUtils.array.number.average(teacher.rating.map(x => x.score)) : 4,
    };
});
