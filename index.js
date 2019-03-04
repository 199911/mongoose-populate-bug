const { assert } = require('chai');

const { MongoMemoryServer } = require('mongodb-memory-server');
const { connectAsync, disconnectAsync } = require('./mongoose.js');

let mongoMemoryServer;
let mongoose;

before('Setup Mock MongoDB', async () => {
  mongoMemoryServer = new MongoMemoryServer({
    autoStart: false,
  });
  await mongoMemoryServer.start();
});

after('Teardown Mock MongoDB', async () => {
  mongoMemoryServer.stop();
});

describe('Populate options test', () => {
  before('Setup mongoose', async () => {
    const uri = await mongoMemoryServer.getConnectionString();
    const name = 'jest';
    mongoose = await connectAsync({ uri, name });
  });

  after('Tear down mongoose', async () => {
    await disconnectAsync(mongoose);
  });

  let StoryList;
  let Kitten;

  before('Setup models', () => {
    const customStoryListSchema = new mongoose.Schema({
      stories: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Stories',
        },
      ],
    }, { timestamps: true });
    StoryList = mongoose.model('StoryLists', customStoryListSchema);
    const storiesSchema = new mongoose.Schema({
      title: {
        type: String,
        required: true,
      },
    }, {
      timestamps: true,
    });
    Story = mongoose.model('Stories', storiesSchema);
  });

  before('Create documents', async () => {
    await Story.create({
        "_id" : mongoose.Types.ObjectId("222222222222222222222222"),
        "title" : "Story A",
    });
    await Story.create({
        "_id" : mongoose.Types.ObjectId("111111111111111111111111"),
        "title" : "Story B",
    });
    await Story.create({
        "_id" : mongoose.Types.ObjectId("000000000000000000000000"),
        "title" : "Story C",
    });
    await StoryList.create({
        "_id" : mongoose.Types.ObjectId("333333333333333333333333"),
        "stories" : [
            mongoose.Types.ObjectId("222222222222222222222222"),
            mongoose.Types.ObjectId("111111111111111111111111"),
            mongoose.Types.ObjectId("000000000000000000000000")
        ],
    });
  });

  context('when get first story', () => {
    let story;
    before('Get first story', async () => {
      const list = await StoryList
        .findById('333333333333333333333333')
        .populate({
          path: 'stories',
          options: {
            skip: 0,
            limit: 1,
          },
        });
      story = list.stories[0];
    });

    it('should return Story A', async () => {
      assert.equal(story.title, 'Story A');
    });
  });

  context('when get second story', () => {
    let story;
    before('Get first story', async () => {
      const list = await StoryList
        .findById('333333333333333333333333')
        .populate({
          path: 'stories',
          options: {
            skip: 1,
            limit: 1,
          },
        });
      story = list.stories[0];
    });

    it('should return Story B', async () => {
      // But it return Story A, which is a duplciated item
      assert.equal(story.title, 'Story B');
    });
  });
});
