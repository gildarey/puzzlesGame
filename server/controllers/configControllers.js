const getConfig = (req, res) => {
    const config = {
        languages: ['English', 'Spanish'],
        themes: ['Light', 'Dark'],
        difficulties: ['Easy', 'Medium', 'Hard'],
    };
    res.json(config);
};

module.exports = { getConfig };
