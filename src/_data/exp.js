const keys = ['diversification', 'offre-accueil', 'attractivite', 'programmation', 'ess'];
module.exports = keys.map((key, i) => Object.assign({}, require('./expertises/' + key + '.json'), { key, num: String(i + 1).padStart(2, '0'), page: 'expertise-' + key }));
