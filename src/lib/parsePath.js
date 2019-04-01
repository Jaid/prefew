const regex = /(?:(?<directory>.*)[/\\]|)(?<name>.*)\.(?<extension>[\da-z]+)/i

export default path => path.match(regex).groups