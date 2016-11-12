const generate = () => Math.random().toString(36).substr(2);

const verify = async (req, db) => {
	const logToken = req.get('logtoken');
	if (!logToken) return null;
	const found = await db.collection('users').findOne({ logToken });
	return (found);
};

export { generate, verify };
