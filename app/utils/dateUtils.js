function getMonday(date) {

    const day = date.getDay();
    const diff = date.getDate() - (day === 0 ? 6 : day - 1);
    const monday = new Date(date);

    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);

    return monday;
}

function getNextMonday(date) {

    const monday = new Date(date);
    const nextMonday = new Date(monday);
    nextMonday.setDate(monday.getDate() + 7);
    nextMonday.setHours(0, 0, 0, 0);

    return nextMonday;
}

module.exports = {

    getMonday,
    getNextMonday
}
