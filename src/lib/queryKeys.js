export const queryKeys = {
  homemeals: {
    all: ["homemeals"],
    list: (cityId, filter) => ["homemeals", "list", cityId, filter],
  },
  meetings: {
    all: ["meetings"],
    list: (cityId, filter) => ["meetings", "list", cityId, filter],
  },
  recos: {
    all: ["recos"],
    list: (cityId, category) => ["recos", "list", cityId, category],
  },
  comments: {
    list: (meetingId, homemealId) => ["comments", meetingId, homemealId],
  },
  notifications: {
    all: ["notifications"],
    list: (userId) => ["notifications", "list", userId],
    unreadCount: (userId) => ["notifications", "unread", userId],
  },
  profile: {
    detail: (userId) => ["profile", userId],
    badges: (userId) => ["badges", userId],
    ranking: (cityId) => ["ranking", cityId],
    myHosted: (userId) => ["myHosted", userId],
    myJoined: (userId) => ["myJoined", userId],
  },
  cities: ["cities"],
  suburbs: (cityId) => ["suburbs", cityId],
  waitlist: (meetingId, homemealId) => ["waitlist", meetingId, homemealId],
  reviews: {
    my: (meetingId, homemealId, userId) => ["reviews", "my", meetingId, homemealId, userId],
  },
};
