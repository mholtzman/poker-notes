const Log = (captions, ...data) => {
    data
        .forEach((s, index) => {
        console.log((captions[index] || "") + JSON.stringify(s, undefined, 4));
    });
}
export { Log };