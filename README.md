# SpamWatch API JavaScript Wrapper (fetch alternate)  

Alternative version of the official [SpamWatch JS API](https://github.com/SpamWatch/spamwatch-js) that uses the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) instead of axios for better compatibility with non-NodeJS clients.

This library has TypeScript types included, so you do not need to install types separately.

## API Documentation
For documentation on the API, visit the SpamWatch documentation at https://docs.spamwat.ch/.

## Example Usage
#### async / await
```
(async () => {
	const client = new Client('APITOKEN');
	console.log(await client.getBan(12345));
})();
```

#### Promise
```
const client = new Client('APITOKEN');
client.getBan(12345).then(ban => console.log).catch(console.err);
```