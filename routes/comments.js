const express = require("express");
const comments = express.Router();
const CommentModel = require(`../models/comments`);

comments.get(`/posts/:id/comments`, async (req, res) => {
	try {
		const posts = await CommentModel.find().populate("post");
		res.status(200).send({
			statusCode: 200,
			posts,
		});
	} catch (error) {
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno del server",
		});
	}
});

comments.get(`/posts/:id/comments/:commentId`, async (req, res) => {
	const { commentId } = req.params;
	try {
		const comment = await CommentModel.findById(commentId);
		if (!comment) {
			return res.status(404).send({
				statusCode: 404,
				message: "Comment don't found",
			});
		}
		res.status(200).send({
			statusCode: 200,
			comment,
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno del server",
		});
	}
});

comments.post(`/posts/:id/comments`, async (req, res) => {
	const newComment = new CommentModel({
		userName: req.body.userName,
		avatar: req.body.avatar,
		commentBody: req.body.commentBody,
		post: req.body.post,
	});
	try {
		const comment = await newComment.save();
		res.status(201).send({
			statusCode: 201,
			message: "Comment saved successfully",
			payload: comment,
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno del server",
		});
	}
});

comments.delete(`/posts/:id/comments/:commentId`, async (req, res) => {
	const { commentId } = req.params;
	try {
		const comment = await CommentModel.findByIdAndDelete(commentId);
		if (!comment) {
			return res.status(404).send({
				statusCode: 404,
				message: "Comment not found or already deleted",
			});
		}
		res.status(200).send({
			statusCode: 200,
			message: "Author deleted successfully",
			comment,
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Server internal error",
		});
	}
});

module.exports = comments;
