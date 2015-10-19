// Define a collection to hold Tasks
Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {
  // This code is executed on the Client only
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

  // Subscribes to all data from the publication "tasks"
  Meteor.subscribe("tasks");

  Meteor.startup(function() {
    // Use Meteor.startup to render the component after the page is ready
    React.render(<App />, document.getElementById("render-target"));
  });
}

if (Meteor.isServer) {
  // Creates a publication named "tasks"
  Meteor.publish("tasks", function() {
    return Tasks.find({
      $or: [
        { private: {$ne: true} },
        { owner: this.userId }
      ]
    });
  });
}

Meteor.methods({
  addTask(text) {
    // Verify login before adding task
    if (! Meteor.userId()) {
      throw new Meteor.Error("Not Authorized");
    }

    Tasks.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },

  removeTask(taskId) {
    const task = Tasks.findOne(taskId);
    if (task.private && task.owner !== Meteor.userId()) {
      throw new Meteor.Error("Not Authorized");
    }

    Tasks.remove(taskId);
  },

  setChecked(taskId, setChecked) {
    const task = Tasks.findOne(taskId);
    if (task.private && task.owner !== Meteor.userId()) {
      throw new Meteor.Error("Not Authorized");
    }

    Tasks.update(taskId, { $set: { checked: setChecked} });
  },

  setPrivate(taskId, setToPrivate) {
    const task = Tasks.findOne(taskId);

    if (task.owner !== Meteor.userId()) {
      throw new Meteor.error("Not Authorized");
    }

    Tasks.update(taskId, { $set: { private: setToPrivate } });
  }
});
