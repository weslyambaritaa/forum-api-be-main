const pool = require('./Database/postgresPool');

const PostgresUserRepository = require('./Repositories/PostgresUserRepository');
const PostgresAuthenticationRepository = require('./Repositories/PostgresAuthenticationRepository');
const PostgresThreadRepository = require('./Repositories/PostgresThreadRepository');
const PostgresCommentRepository = require('./Repositories/PostgresCommentRepository');
const PostgresReplyRepository = require('./Repositories/PostgresReplyRepository');
const PostgresCommentLikeRepository = require('./Repositories/PostgresCommentLikeRepository');

const passwordManager = require('./Security/password');
const tokenManager = require('./Security/token');

const AddUserUseCase = require('../Applications/UseCases/AddUserUseCase');
const AuthenticationUseCase = require('../Applications/UseCases/AuthenticationUseCase');
const ThreadUseCase = require('../Applications/UseCases/ThreadUseCase');
const GetThreadDetailUseCase = require('../Applications/UseCases/GetThreadDetailUseCase');
const CommentUseCase = require('../Applications/UseCases/CommentUseCase');
const ReplyUseCase = require('../Applications/UseCases/ReplyUseCase');
const ToggleCommentLikeUseCase = require('../Applications/UseCases/ToggleCommentLikeUseCase');

const UserController = require('../Interfaces/Http/Api/Controllers/UserController');
const AuthenticationController = require('../Interfaces/Http/Api/Controllers/AuthenticationController');
const ThreadController = require('../Interfaces/Http/Api/Controllers/ThreadController');
const CommentController = require('../Interfaces/Http/Api/Controllers/CommentController');
const ReplyController = require('../Interfaces/Http/Api/Controllers/ReplyController');
const CommentLikeController = require('../Interfaces/Http/Api/Controllers/CommentLikeController');

const userRepository = new PostgresUserRepository(pool);
const authenticationRepository = new PostgresAuthenticationRepository(pool);
const threadRepository = new PostgresThreadRepository(pool);
const commentRepository = new PostgresCommentRepository(pool);
const replyRepository = new PostgresReplyRepository(pool);
const commentLikeRepository = new PostgresCommentLikeRepository(pool);

const userUseCase = new AddUserUseCase(userRepository, passwordManager);
const authenticationUseCase = new AuthenticationUseCase(
  userRepository,
  authenticationRepository,
  passwordManager,
  tokenManager
);
const threadUseCase = new ThreadUseCase(threadRepository);
const commentUseCase = new CommentUseCase(commentRepository, threadRepository);
const replyUseCase = new ReplyUseCase(replyRepository, commentRepository, threadRepository);
const commentLikeUseCase = new ToggleCommentLikeUseCase(
  commentLikeRepository,
  commentRepository,
  threadRepository
);
const threadDetailUseCase = new GetThreadDetailUseCase(
  threadRepository,
  commentRepository,
  replyRepository,
  commentLikeRepository
);

const userController = new UserController(userUseCase);
const authenticationController = new AuthenticationController(authenticationUseCase);
const threadController = new ThreadController(threadUseCase, threadDetailUseCase);
const commentController = new CommentController(commentUseCase);
const replyController = new ReplyController(replyUseCase);
const commentLikeController = new CommentLikeController(commentLikeUseCase);

module.exports = {
  pool,
  tokenManager,
  userController,
  authenticationController,
  threadController,
  commentController,
  replyController,
  commentLikeController,
};
