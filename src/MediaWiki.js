import nodeFetch from 'node-fetch';
import fetchCookie from 'fetch-cookie';

const fetch = fetchCookie(nodeFetch);

export class MediaWiki {
	/**
	 * @param {any} options
	 */
	constructor(options) {
		this.options = options;
	}

	/**
	 * Login to MediaWiki
	 * @param {string} username
	 * @param {string} password
	 * @return {Promise<Record<string, unknown>>}
	 */
	async login(username, password) {
		fetch();

		return {};
	}
}
