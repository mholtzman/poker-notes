const Log = (captions, ...data) => {
    captions
        .filter(c => c)
        .forEach((s, index) => {
        console.log(s.trim() + JSON.stringify(data[index], undefined, 4));
    });
}
export { Log };