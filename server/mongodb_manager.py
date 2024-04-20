from pymongo.mongo_client import MongoClient


class MongoDBManager:
    def __init__(self, uri, db_name):
        self.client = MongoClient(uri)
        self.db = self.client[db_name]
        # Send a ping to confirm a successful connection
        try:
            self.client.admin.command("ping")
            print("Pinged your deployment. You successfully connected to MongoDB!")
        except Exception as e:
            print(e)

    def get_lecture(self, user_email, lecture_title):
        """
        Retrieve data for a specific user and lecture title.
        :param user_email: Email of the user.
        :param lecture_title: Title of the lecture.
        :return: Data as a dictionary or None if not found.
        """

        collection = self.db.lectures
        data = collection.find_one(
            {"email": user_email, "lectures.title": lecture_title},
            {"lectures.$": 1, "_id": 0}
        )
        if data and "lectures" in data:
            return data["lectures"][0]
        else:
            return None

    def get_template(self, template_id):
        """
        Retrieves tremplate slide data based on a template ID.
        :param template_id: The ID of the template to use.
        :return: A dictionary representing the slide layout or None if template not found.
        """
        collection = self.db.templates
        template = collection.find_one({"template_id": template_id})

        if not template:
            return None

        # Construct the slide based on the template
        slide = {
            "description": template["description"],
            "num_images": template["num_images"],
            "num_texts": template["num_texts"],
        }
        return slide

    def close(self):
        """
        Close the MongoDB connection.
        """
        self.client.close()
